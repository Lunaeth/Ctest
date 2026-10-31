# AIIO questions 1–36: technical review

Reviewed on 2026-10-30. This is a partial content audit, not a completed release.
The authored source is in the three `scripts/ai-study-content/nca-aiio-*.mjs`
batches. Each entry records the exact primary-reference URLs and what they support.
The original English stem, options and original answer/explanation remain in the data.
All 36 intended answer keys were retained after comparing the available alternatives;
retaining an answer does not endorse every absolute phrase in the source question.

## Findings that changed the teaching content

| Questions | Review conclusion |
| --- | --- |
| 1, 5 | Online inference has response-time targets, but offline inference exists. Training learns parameters; inference uses the learned model. Neither real-time processing nor a huge dataset universally defines a stage. |
| 2, 3, 10, 12 | Distinguish workload framework, programming platform, inference service and numerical library. cuDNN does accelerate deep learning; it is not correct to reject it by claiming it has no ML role. RAPIDS is the intended general suite. |
| 4, 16 | Compute, data and methods are complementary drivers. Semiconductor scaling, connectivity and data-producing applications can contribute; they are not intrinsically irrelevant. |
| 6, 15 | CPU and GPU design priorities differ. CPUs also parallelize, GPU speedups depend on workloads, and core counts/clock rates cannot be compared as identical units. |
| 7 | GPU Operator manages infrastructure drivers and monitoring; PyTorch/TensorFlow are application frameworks. Preinstalled drivers are possible. |
| 8, 19 | Multi-node training requires a suitable parallelization strategy. Replicated DDP does not make an oversized model fit by pooling memory; sharding and model parallelism address different constraints. Inference can also span nodes. |
| 9 | Transformer is the intended mainstream answer, not the only possible LLM architecture. The Mamba paper is included as direct evidence for the state-space counterexample. |
| 11 | DGX OS is Ubuntu-based; this does not mean all NVIDIA software requires DGX OS. |
| 13, 14 | DL is within ML within AI. Dataset size alone is not the definition of deep learning. |
| 17 | Corrected the old attribution of general shading to RT Cores: hardware traversal/intersection assists shader execution rather than replacing the entire rendering pipeline. |
| 18 | H100 fits the assumed large data-center training workload; DRIVE Orin addresses automotive execution/development. Do not claim L4 cannot train any model. |
| 20, 21, 23 | RDMA offloads communication work; it does not fix unrelated CPU saturation or packet loss, and does not remove all CPU coordination. |
| 22, 24 | Ownership gives direct control, not guaranteed security or sovereignty compliance. Cloud lowers initial acquisition cost, not necessarily lifetime cost or every transfer charge. |
| 25 | Vendor storage guidance explicitly includes random I/O and read-dominant training. B is the only read choice, but the original claim that training universally streams sequentially is unsupported. |
| 26 | The four-fabric count is explicitly scoped to the DGX H100 SuperPOD reference architecture: compute, storage, in-band and out-of-band management. |
| 27 | The 1 GbE BMC port is out of band. Corrected the old explanation to acknowledge the separate 10 GbE RJ45 system interface and avoid an inaccurate generic connector description. |
| 28 | Used the original A100 datasheet to verify eight single-port ConnectX-6 adapters. Later configuration variants and separate dual-port storage adapters must not change the requested count. |
| 29 | PUE is facility energy divided by IT energy. At 1.2 the overhead is 20% of IT energy, not 20% of total facility energy; lower PUE alone says nothing about useful AI output. |
| 30 | RTX configuration must match rendering and application requirements. Certification alone does not provide collaboration software, vWS licensing or all required capabilities. |
| 31, 32 | GPUDirect avoids selected staging/copy paths, not all CPU or OS involvement. RDMA still needs memory ordering; GDS has a CPU control path and fallback modes. |
| 33 | The required role is a running subnet manager. OpenSM is one implementation, not mandatory software on every host. |
| 34 | Physical density requires simultaneous power, cooling and space planning; available rack units alone are insufficient. |
| 35 | Ethernet supports RDMA through RoCE. Neither bandwidth nor end-to-end latency has a universal ordering across all generations and configurations. |
| 36 | Networking/security are valid DPU uses but incomplete descriptions; the broader purpose includes infrastructure offload, acceleration and isolation. |

## Evidence and remaining scope

The compiler validates bilingual fields, complete option sets, valid answer keys,
reference structure and preservation of original source fields. The cross-view
tests render **every reviewed scored question** in learning, practice feedback,
mistakes and exam results and verify that unanswered practice/exam views do not
reveal explanations or references. These checks catch missing content and display
regressions; they do not replace semantic reading of the references.

No claim is made that the remaining AIIO 37–116, remaining DCAI questions,
illustrated reviews, AI knowledge maps or production accounts are complete.
Full-bank semantic and browser checks remain required before publication.
