# AIIO questions 97–116: final authoring batch

Reviewed 2026-10-30. All 116 AIIO questions now have authored bilingual stems, option translations, individual option reasons, study notes, terminology, memory cues and primary references. This completes AIIO authoring, not the full project: DCAI still has 57 pending reviews, and topic features, browser validation and production accounts/Turnstile remain release requirements.

## Corrections and qualifications

- 97–98: distinguish container orchestration from databases, Spark processing and job scheduling; CUDA is NVIDIA's broad computing platform, while OpenCL is a genuine cross-vendor alternative. No unsupported global ecosystem ranking is asserted.
- 99–100: fabric tuning addresses a measured communication bottleneck, not every slow training step. Shared-memory reuse and high bandwidth help the appropriate memory path; additional ports or inference ASICs do not automatically fix it.
- 101: fine-grained resource control is not unique to cluster workload managers. Linux cgroups provide a counterexample; the intended difference is coordinated cluster-job allocation rather than node-local process control.
- 102–103: GDS requires a supported direct storage/GPU path and retains control-plane CPU work. Slurm's role is policy-driven scheduling, not facility electrical reconfiguration, automatic overclocking or exclusive container support.
- 104: the source's C-only key is ambiguous because simplifying configuration/monitoring (D) is also a valid operational benefit. The question explicitly asks for two benefits in the reviewed version, with C and D accepted together. The original stem, single-answer type and C key are preserved in `originalStem`, `originalType` and `originalAnswer`. The compiler validates and applies explicit English stem corrections before generating learning views. This makes five reviewed AIIO multi-select questions while preserving the four original multi-select records.
- 105: collective hardware offload requires capable SHARP hardware/software and configuration; it is not guaranteed by every InfiniBand connection. Security, power and ease-of-operation absolutes are rejected.
- 106: allocation and monitoring help diagnose and prevent contention-related OOM, but do not create GPU memory or solve oversized tensors, leaks or fragmentation automatically. Host RAM and GPU VRAM must be distinguished.
- 107–108: hybrid placement supports governance rather than proving legal compliance; automated failover needs redundant capacity, failure-domain design and recoverable state.
- 109–112: RDMA offloads transfers rather than increasing clocks/compressing data; AI Factories include production inference; containers reduce dependency drift subject to host compatibility; Slurm and Kubernetes roles overlap without being interchangeable.
- 113: iWARP is a genuine TCP-based RDMA stack. RoCE is the intended answer for the referenced NVIDIA Ethernet ecosystem, not the only Ethernet RDMA technology. PFC/ECN are flow/congestion control, not complete RDMA semantics.
- 114–116: priority affects eligible scheduling order rather than guaranteeing immediate execution. Edge means near-source processing, not CPU-only or network-free operation. Drift needs monitoring and diagnosis; changed input distribution does not alone prove predictive degradation. Updates require representative data and evaluation before release.

## Validation

All 241 JavaScript tests pass. The cross-view bilingual and answer-hiding checks now cover every AIIO question. Added checks verify question 104's source preservation, revised choose-two prompt and practice/exam scoring. Existing corrected-answer loading applies to this changed key. Original multi-select counts are tested separately from revised counts rather than weakening the source-preservation check.

Reference URLs were read using AnySearch and primary-site browsing. NVIDIA's older SHARP documentation URL has moved; the entry uses the verified `networking-docs.nvidia.com/sharpum/310/introduction` destination. AWS model-monitoring references support the monitoring pattern; they are not a recommendation to adopt that service, whose current documentation limits new customer availability.

Tests verify structure and behavior, not semantic correctness by themselves. Final whole-bank review, browser checks and feature parity remain required before publication.
