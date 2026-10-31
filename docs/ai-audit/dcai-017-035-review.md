# DCAI 17–35 review

Reviewed on 2026-10-30. This batch adds 17–28 and 30–35. Illustrated 29 was already reviewed. DCAI now has authored bilingual study content for IDs 1–36 (36/60); AIIO has 116/116. The remaining 24 DCAI questions, AI knowledge maps and production account acceptance remain open. Authoring coverage is not a claim of complete product acceptance.

## Answer correction and provenance

**26 changes from A to B.** The official [Cisco Live 2025 BRKDCN-2677 PDF](https://www.ciscolive.com/c/dam/r/ciscolive/global-event/docs/2025/pdf/BRKDCN-2677.pdf), PDF page 43 / printed slide 44, was rendered and visually inspected. The template screenshot labels Small as 4 servers / 32 GPUs, and Medium as 12 servers / 96 GPUs. The slide explicitly marks the image pre-release and subject to change. The question now names that documented template and year rather than asserting a permanent product-wide size convention. A generic reference architecture showing 96 GPUs would not, by itself, establish the template name.

Local evidence (not redistributed as repository content):

- `C:/Server/ai-research/hyperfabric-2677.pdf`, SHA-256 `f850a7a337b261a91506f7f444b83d3e2dcea0e3036beda2e9e84e96cca05cc4`.
- `C:/Server/ai-research/hyperfabric-template-44.png`, SHA-256 `fdb7ffe75728200000f8ff1020c01249b28bd0283400d130a0d9f8eda74077a0`.

The original answer A and original stem remain in the generated bank. Practice and exams grade B. Saved practice selections are re-evaluated on load and bank switch, preserving the chosen option and favorites; a previously accepted A enters the mistake book, while a newly accepted B follows the existing correct-mistake removal preference. Other banks are unchanged. Existing submitted exam aggregates are not silently rewritten.

IDs **23 and 25 remain C**. Their imported source keys are already C, even though old explanation prose refers to earlier answer labels. No fabricated original key is introduced.

## Clarified questions and options

- **18:** replaced an unverified X-Series/H100 combination and unqualified real-time application profiling claim with supported UCS/GPU infrastructure telemetry. Metrics depend on platform, driver and collection support; detailed application profiling remains complementary.
- **19:** normalized the X580p name. Intel CPU is the decisive distinction among the listed platforms. NVLink requires compatible GPUs and bridges; concern for power does not prove this configuration has universally lower energy use.
- **21:** explicitly requires NVMe/RDMA traffic in a PFC-enabled RoCEv2 design. TCP transports can also traverse a PFC Ethernet underlay; PFC is not exclusive to one storage protocol.
- **22:** changed the library name alone to NCCL-based collective benchmarks (`nccl-tests`), and clarified that the measurement is actual GPU collectives. General network generators remain useful for other validation tasks.
- **25:** scoped the switch command to supported NX-OS/platform/NIC combinations with the prerequisites already met. `hardware profile spectrum-x` is not a universal command for all Nexus switches or a complete deployment procedure.
- **27:** replaced the undefined “GPU Performance” label with the documented GPU Temperature metric and aligned the stem to activity and thermal conditions. Utilization does not prove efficient kernels; temperature alone does not establish throttling.
- **28:** visually read the alarm as receive-error delta on switch B, slot 1, physical port 11. Removed the unsupported SFP+ form factor. Check actual counter changes and reset/wrap artifacts; the alert is not proof of failed optics, a CRC-only error, or port-channel 11.
- **30:** identified Fleet Management's location profiles and Blueprints for hardware/OS deployment. This is not a promise that arbitrary AI applications are automatically deployed by the same feature.
- **31:** added the missing modular chassis and X-Fabric/PCIe node requirement. Generic GPU, memory and virtualization requirements alone cannot exclude C-Series rack servers.
- **32:** added shared online access and independent capacity as explicit selection criteria, excluding an additional distributed software layer on local disks. Local disks can support distributed storage with appropriate software. An IP array alone neither enforces confidentiality nor guarantees retrieval performance or safe multiwriter block access.
- **33:** clarified two distinct prerequisites instead of asserting an unsupported mandatory mezzanine-before-XFM ordering. C now includes every compute/PCIe node pair; D specifies the supported M8 PCI Gen5 mezzanine. IFM network uplinks are distinct from XFM PCIe connectivity. The exact hardware guide remains authoritative for the complete procedure.
- **35:** corrected “retaining” to “retraining” in the parameter-update distractor. RAG supplies retrieved context; fine-tuning updates weights, and the two can be combined.

All changed stems and option text retain their original values. Each authored question has bilingual option-specific reasoning, summary, memory aid, pitfall, steps, terminology and primary-reference support notes.

## Other verified distinctions

- **17:** Unified Edge's 768 GB limit is per compute-node host RAM. Redundant chassis controllers do not establish application high availability; zero-touch provisioning still needs basic physical connectivity and prepared configuration.
- **20:** the specified NVIDIA HGX C885A configuration supplies NVLink. L40 and A16 alternatives lack that interconnect; the AMD MI210 alternative is not NVIDIA NVLink. The official NVIDIA positioning table was visually checked for A16.
- **23:** the DLB interface list belongs to the hardware-profile configuration context. A QoS match alone does not replace that port list.
- **24:** Nexus Dashboard's templates and traffic analytics match the requested NX-OS operating model. Intersight compute management and Hyperfabric cloud management have distinct roles.
- **34:** scheduling assigns eligible compute resources under constraints; optimized performance is an objective, not a universal optimality guarantee.
- **35:** RAG still needs maintained data and indexes; it does not eliminate bias, hallucinations or access-control requirements.

## Validation

The full JavaScript suite passes **249 tests**. New regression cases exercise Q26 practice/exam scoring, saved A/B selections on startup and bank switch, unchanged other-bank records and preserved favorites. Cross-view tests cover revised stems/options, all authored bilingual explanations and references, and no explanation leakage in unanswered practice/exams.

The first test run identified untranslated product-only labels in the Chinese fields and an overbroad assertion treating `NCCL` inside the corrected longer option as stale text. The labels now include appropriate Chinese product-role wording; the test checks removal of obsolete wording only when it is not legitimately a substring of the corrected option. The revised test still verifies the complete corrected option in every view.

Compiler repeat-build identity and `git diff --check` are checked before commit. No new browser-render acceptance is claimed for this batch. There is no production release of this partial content audit; ca remains the one-button portal and learn remains the complete application on production commit 8815039.
