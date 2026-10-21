"""Build the on-demand atlas chunks from Natural Earth via world-atlas and us-atlas.

Sources (not committed):
  world-atlas countries-110m.json (Natural Earth, public domain)
  us-atlas states-10m.json (Natural Earth, public domain)
  Natural Earth 50m admin-1, Canada only (public domain)

Run from the repo with the downloads already in /tmp/atlas, or let this script fetch them.
"""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data"
TMP = Path("/tmp/atlas")
EU = {
    "040", "056", "100", "191", "196", "203", "208", "233", "246", "250", "276", "300",
    "348", "372", "380", "428", "440", "442", "470", "528", "616", "620", "642", "703",
    "705", "724", "752",
}
POSTAL = {
    "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT",
    "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL",
    "18": "IN", "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD",
    "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT", "31": "NE",
    "32": "NV", "33": "NH", "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
    "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
    "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA", "54": "WV",
    "55": "WI", "56": "WY",
}
ALIASES = {
    "USA": ["United States", "United States of America", "US", "USA", "U.S.", "U.S.A."],
    "GBR": ["United Kingdom", "UK", "U.K.", "Great Britain", "Britain"],
    "RUS": ["Russia", "Russian Federation"],
    "KOR": ["South Korea", "Republic of Korea", "Korea"],
    "PRK": ["North Korea"],
    "CZE": ["Czechia", "Czech Republic"],
    "COD": ["Democratic Republic of the Congo", "DRC", "Congo-Kinshasa", "Dem. Rep. Congo"],
    "COG": ["Republic of the Congo", "Congo-Brazzaville"],
    "VNM": ["Vietnam", "Viet Nam"],
    "LAO": ["Laos"],
    "SYR": ["Syria"],
    "IRN": ["Iran"],
    "TZA": ["Tanzania"],
    "VEN": ["Venezuela"],
    "BOL": ["Bolivia"],
    "MDA": ["Moldova"],
    "TWN": ["Taiwan"],
    "PSE": ["Palestine"],
    "SWZ": ["Eswatini", "Swaziland", "eSwatini"],
    "CIV": ["Ivory Coast", "Cote d'Ivoire", "Côte d'Ivoire"],
    "TUR": ["Turkey", "Turkiye", "Türkiye"],
    "MMR": ["Myanmar", "Burma"],
    "CAF": ["Central African Republic", "Central African Rep."],
    "DOM": ["Dominican Republic", "Dominican Rep."],
    "GNQ": ["Equatorial Guinea", "Eq. Guinea"],
    "PNG": ["Papua New Guinea"],
    "ARE": ["United Arab Emirates", "UAE"],
    "MKD": ["North Macedonia", "Macedonia"],
}


def fetch(url: str, dest: Path) -> None:
    if dest.exists() and dest.stat().st_size > 1000:
        return
    dest.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(url, dest)


def load_iso() -> dict[str, tuple[str, str, str]]:
    fetch(
        "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv",
        TMP / "iso.csv",
    )
    out: dict[str, tuple[str, str, str]] = {}
    for line in (TMP / "iso.csv").read_text().splitlines()[1:]:
        parts = []
        cur = ""
        quote = False
        for ch in line:
            if ch == '"':
                quote = not quote
            elif ch == "," and not quote:
                parts.append(cur)
                cur = ""
            else:
                cur += ch
        parts.append(cur)
        if len(parts) < 4:
            continue
        name, iso2, iso3, num = parts[0], parts[1], parts[2], parts[3].zfill(3)
        out[num] = (iso3, iso2, name)
    return out


def decode_arc(topo: dict, index: int, reverse: bool) -> list[tuple[float, float]]:
    x = y = 0
    pts = []
    for dx, dy in topo["arcs"][index]:
        x += dx
        y += dy
        pts.append((x, y))
    scale = topo["transform"]["scale"]
    translate = topo["transform"]["translate"]
    out = [(px * scale[0] + translate[0], py * scale[1] + translate[1]) for px, py in pts]
    if reverse:
        out.reverse()
    return out


def stitch(topo: dict, ring: list[int]) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    for idx in ring:
        rev = idx < 0
        part = decode_arc(topo, ~idx if rev else idx, rev)
        if pts and part:
            part = part[1:]
        pts.extend(part)
    return pts


def geom_polys(topo: dict, geom: dict) -> list[list[list[tuple[float, float]]]]:
    if geom["type"] == "Polygon":
        return [[stitch(topo, ring) for ring in geom["arcs"]]]
    return [[stitch(topo, ring) for ring in poly] for poly in geom["arcs"]]


def dist(p, a, b) -> float:
    ax, ay = a
    bx, by = b
    px, py = p
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    qx, qy = ax + t * dx, ay + t * dy
    return ((px - qx) ** 2 + (py - qy) ** 2) ** 0.5


def dp(points: list[tuple[float, float]], eps: float) -> list[tuple[float, float]]:
    if len(points) < 3:
        return points
    end = len(points) - 1
    md, mi = 0.0, -1
    for i in range(1, end):
        d = dist(points[i], points[0], points[end])
        if d > md:
            md, mi = d, i
    if md > eps and mi > 0:
        left = dp(points[: mi + 1], eps)
        right = dp(points[mi:], eps)
        return left[:-1] + right
    return [points[0], points[end]]


def encode_arcs(polys: list[list[list[tuple[float, float]]]]) -> tuple[list, list]:
    scale = [0.02, 0.02]
    translate = [-180.0, -90.0]
    arcs = []
    encoded = []
    for poly in polys:
        rings = []
        for ring in poly:
            if len(ring) < 4:
                continue
            simple = dp(ring, 0.35)
            if len(simple) < 4:
                continue
            if simple[0] != simple[-1]:
                simple.append(simple[0])
            quantized = []
            for lon, lat in simple:
                quantized.append((
                    int(round((lon - translate[0]) / scale[0])),
                    int(round((lat - translate[1]) / scale[1])),
                ))
            delta = []
            px = py = 0
            for x, y in quantized:
                delta.append([x - px, y - py])
                px, py = x, y
            rings.append([len(arcs)])
            arcs.append(delta)
        if rings:
            encoded.append(rings)
    return arcs, encoded


def topology(geoms: list[dict]) -> dict:
    return {
        "type": "Topology",
        "objects": {"regions": {"type": "GeometryCollection", "geometries": geoms}},
        "arcs": [],
    }


def write_topo(path: Path, topo: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(topo, separators=(",", ":")))
    print(path.name, path.stat().st_size)


def subset_world(topo: dict, keep: set[str] | None, iso: dict[str, tuple[str, str, str]]) -> tuple[dict, list[dict]]:
    geoms = []
    used: list[int] = []

    def walk(node):
        if isinstance(node, int):
            used.append(~node if node < 0 else node)
        else:
            for item in node:
                walk(item)

    directory = []
    for geom in topo["objects"]["countries"]["geometries"]:
        raw = str(geom.get("id") or "").zfill(3)
        if not raw.strip("0") and raw != "000":
            continue
        if keep is not None and raw not in keep:
            continue
        code = iso.get(raw)
        if not code:
            continue
        iso3, iso2, official = code
        walk(geom["arcs"])
        short = geom.get("properties", {}).get("name") or official
        aliases = []
        for item in [iso3, iso2, official, short, *ALIASES.get(iso3, [])]:
            if item and item not in aliases:
                aliases.append(item)
        directory.append({"id": iso3, "iso2": iso2, "name": short, "aliases": aliases})
        geoms.append({"geom": geom, "id": iso3, "name": short})

    order = []
    seen = set()
    for index in used:
        if index not in seen:
            seen.add(index)
            order.append(index)
    remap = {old: new for new, old in enumerate(order)}

    def rewrite(node):
        if isinstance(node, int):
            rev = node < 0
            index = ~node if rev else node
            mapped = remap[index]
            return ~mapped if rev else mapped
        return [rewrite(item) for item in node]

    out_geoms = []
    for item in geoms:
        out_geoms.append({
            "type": item["geom"]["type"],
            "id": item["id"],
            "arcs": rewrite(item["geom"]["arcs"]),
            "properties": {"name": item["name"]},
        })
    out = {
        "type": "Topology",
        "transform": topo["transform"],
        "arcs": [topo["arcs"][index] for index in order],
        "objects": {"regions": {"type": "GeometryCollection", "geometries": out_geoms}},
    }
    return out, directory


def main() -> None:
    TMP.mkdir(parents=True, exist_ok=True)
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json", TMP / "countries-110m.json")
    fetch("https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json", TMP / "states-10m.json")
    fetch(
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_1_states_provinces.geojson",
        TMP / "admin1-50m.geojson",
    )
    iso = load_iso()
    world = json.loads((TMP / "countries-110m.json").read_text())
    us = json.loads((TMP / "states-10m.json").read_text())
    admin = json.loads((TMP / "admin1-50m.geojson").read_text())

    world_topo, world_dir = subset_world(world, None, iso)
    eu_topo, eu_dir = subset_world(world, EU, iso)
    write_topo(DATA / "world.json", world_topo)
    write_topo(DATA / "eu.json", eu_topo)

    us_geoms = []
    us_dir = []
    for geom in us["objects"]["states"]["geometries"]:
        fips = str(geom.get("id") or "").zfill(2)
        postal = POSTAL.get(fips)
        if not postal:
            continue
        name = geom["properties"]["name"]
        aliases = [postal, fips, name]
        if postal == "DC":
            aliases.extend(["Washington DC", "Washington, D.C.", "D.C.", "District of Columbia"])
        us_geoms.append({
            "type": geom["type"],
            "id": postal,
            "arcs": geom["arcs"],
            "properties": {"name": name, "fips": fips},
        })
        us_dir.append({"id": postal, "fips": fips, "name": name, "aliases": aliases})
    us_topo = {
        "type": "Topology",
        "transform": us["transform"],
        "arcs": us["arcs"],
        "objects": {"regions": {"type": "GeometryCollection", "geometries": us_geoms}},
    }
    write_topo(DATA / "us.json", us_topo)

    canada_geoms = []
    canada_dir = []
    arcs: list = []
    for feature in admin["features"]:
        props = feature["properties"]
        if props.get("adm0_a3") != "CAN":
            continue
        postal = props.get("postal") or ""
        name = "Quebec" if props.get("name") == "Québec" else props.get("name")
        polys = geom_polys_geo(feature["geometry"])
        encoded_arcs, encoded = encode_arcs(polys)
        base = len(arcs)
        arcs.extend(encoded_arcs)
        shifted = []
        for poly in encoded:
            shifted.append([[index + base for index in ring] for ring in poly])
        if not shifted:
            continue
        kind = "Polygon" if len(shifted) == 1 else "MultiPolygon"
        canada_geoms.append({
            "type": kind,
            "id": postal,
            "arcs": shifted[0] if kind == "Polygon" else shifted,
            "properties": {"name": name},
        })
        aliases = [postal, name, props.get("iso_3166_2") or "", props.get("name") or ""]
        if name == "Quebec":
            aliases.append("Québec")
        if name == "Yukon":
            aliases.append("Yukon Territory")
        canada_dir.append({
            "id": postal,
            "name": name,
            "aliases": [item for item in dict.fromkeys(aliases) if item],
        })
    canada = {
        "type": "Topology",
        "transform": {"scale": [0.02, 0.02], "translate": [-180, -90]},
        "arcs": arcs,
        "objects": {"regions": {"type": "GeometryCollection", "geometries": canada_geoms}},
    }
    write_topo(DATA / "canada.json", canada)

    directory = {"world": world_dir, "us": us_dir, "canada": canada_dir, "eu": eu_dir}
    (DATA / "directory.json").write_text(json.dumps(directory, separators=(",", ":")))
    print("directory", (DATA / "directory.json").stat().st_size, "world", len(world_dir), "eu", len(eu_dir), "us", len(us_dir), "canada", len(canada_dir))

    usa = next(g for g in world_topo["objects"]["regions"]["geometries"] if g["id"] == "USA")
    bbox = [180, 90, -180, -90]
    for poly in geom_polys(world_topo, usa):
        for ring in poly:
            for lon, lat in ring:
                bbox[0] = min(bbox[0], lon)
                bbox[1] = min(bbox[1], lat)
                bbox[2] = max(bbox[2], lon)
                bbox[3] = max(bbox[3], lat)
    print("USA bbox", [round(v, 2) for v in bbox])


def geom_polys_geo(geom: dict) -> list[list[list[tuple[float, float]]]]:
    if geom["type"] == "Polygon":
        return [[[(p[0], p[1]) for p in ring] for ring in geom["coordinates"]]]
    return [[[(p[0], p[1]) for p in ring] for ring in poly] for poly in geom["coordinates"]]


if __name__ == "__main__":
    main()
