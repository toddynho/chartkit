import { bindSampling } from "./sampling-run";
import { notedDense, notedLinear, useSampler } from "./sampling";

useSampler(bindSampling({ notedDense, notedLinear }));
