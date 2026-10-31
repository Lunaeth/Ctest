# AIIO questions 85–96 and answer-correction persistence

Reviewed on 2026-10-30. AIIO questions 1–96 and DCAI questions 1, 7 and 14 now have authored reviews: 99 of 176 total. The remaining 77 questions, AI topic features, full browser review and production accounts/Turnstile still prevent release.

## Verified answer correction

AIIO 85 asks for the number of out-of-band network management connections on a DGX H100. The imported answer C (two) conflicts with the [DGX hardware guide](https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html): its component table identifies a dedicated 1 GbE RJ45 BMC interface, separately from system-management interfaces. The [connection instructions](https://docs.nvidia.com/dgx/dgxh100-user-guide/connect-dgx.html) also distinguish remote BMC access from SSH to the host OS. The reviewed answer is A (one). `originalAnswer` and `originalExplanation` retain the source key and assertion.

Practice and exam regression checks verify that A scores correctly and C no longer does. Source preservation and the per-option bilingual reasons explain the correction.

## Other content qualifications

- 86: filled the source's missing explanation. Seven MIG GPU instances is an upper limit for relevant models/profiles, not all MIG-enabled products; GPU instances differ from compute-instance subdivisions.
- 87: BMC access with the host off requires standby power and management connectivity. It is not the server's primary storage controller, firewall or workload network interface.
- 88–89: Kubernetes manages replicas/services; Slurm schedules resources/jobs. Neither increases physical GPU/CPU capability or automatically writes optimal application algorithms.
- 90–91: distinguish NVIDIA Triton Inference Server from the Triton kernel language, TensorRT engines, TensorFlow and TensorFlow Serving. Slurm may launch containers; Apptainer is a container runtime; MLOps is a practice, not one orchestrator.
- 92–93: GPU arithmetic-lane counts are not one-for-one CPU-core equivalents. RoCE is the listed Ethernet RDMA option, not a prerequisite for every AI cluster; direct GPU memory access also requires compatible GPUDirect integration.
- 94–96: inference can be CPU/GPU, interactive/batched; low latency is not the sole target of all inference. AI Factories include inference as well as data processing and training. Effective communication performance depends on topology and contention, not only nominal line rate.

## Existing progress after answer corrections

Previously, startup and bank switching filtered saved progress IDs but trusted saved `correct` flags. After an answer-key correction, accuracy and mistakes could therefore disagree with current grading.

For reviewed scored questions whose answer differs from the original key, state loading now regrades existing nonempty selections. It preserves selections and stores the previous correctness, reviewed answer and review date in `answerReview`. A newly incorrect selection enters the mistake list. A newly correct selection leaves it only when the user's existing automatic-removal setting permits that behavior. Already regraded records do not repeatedly restore a manually removed mistake. Favorites, other banks and the input persistence object are preserved.

Startup persists a detected correction through the existing storage interface before further interaction, so both guest storage and the account storage adapter can retain it. Bank switching uses its existing persistence path. Historical completed-exam aggregates remain historical; active exams are graded with the current answer key.

## Validation

All 240 JavaScript tests pass, including the full reviewed-question cross-view checks and new real-question checks for practice/exam grading, startup persistence, bank switching, retained-mistake preference, reload behavior and source preservation. These are local tests; browser and production account synchronization remain release requirements. No partial release has been pushed or deployed.
