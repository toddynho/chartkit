import { mountFeatures } from "./features";
import { bindSampling } from "./sampling-run";
import { notedDense, notedLinear, useSampler } from "./sampling";

mountFeatures();

useSampler(bindSampling({ notedDense, notedLinear }));
