# DCAI 37–60 review — 2026-10-30

All 24 remaining scored questions now have Chinese stems/options, individual English and Chinese option reasons, reasoning steps, terminology, memory cues, pitfalls and primary technical references. Source stems, option wording and keys are retained in the generated records where revised. Combined authored coverage is 60/60 DCAI (56 scored + four illustrated) and 116/116 AIIO. Coverage is a completeness measure, not proof of semantic correctness or feature parity.

## Material corrections

- **49 B → A:** anchored to the September 1, 2026 Hyperfabric data-sheet entitlement table. Its Essentials column includes cloud management, RoCEv2, AI use cases and Cisco UCS or BYO servers. Premier identifies bundled UCS/full-stack capabilities. The introductory generalization about Premier for AI cannot override those specific rows. This is edition-specific, not a permanent licensing rule.
- **57 B → C:** the Cisco Mode installation workflow uses an OS image and SCU. A user-supplied installation configuration describes Custom mode; it must not replace SCU in the Cisco Mode answer.
- **38, 41, 42, 46, 47, 50, 56:** explicit scenario scope removes broad unsupported claims: online inference latency; rail alignment can coexist with leaf/spine; X-Series Direct dual 100 Gb/s links provide aggregate capacity, not one flow at 200 Gb/s; diagnosed network bottlenecks; gradient-based neural networks; FI-specific connectivity; full-stack component completeness.
- **43:** the question now asks about the documented Hyperfabric email-verification/default-policy workflow with a working mail path. An unreachable mail system can cause real failures and is excluded by the scenario, not declared impossible.
- **44:** Nexus Dashboard 4.3.1 requires disabling fabric flow telemetry and removing flow rules before enabling Traffic Analytics; it is not an automatic transition.
- **45:** GPO tags alone do not enforce tenant isolation. The revised option explicitly combines VNIs with enforced SGACL policy; default unenforced mode, explicit permits and BUM exclusions are discussed.
- **50, 58:** port channels are defined per Fabric Interconnect; do not imply one cross-FI LAG or single-flow aggregation across all members.
- **51:** distinguishes host CPU activity, GPU activity, memory-controller utilization and framebuffer capacity. Metrics availability must be checked per platform; the question does not claim all metrics are native to every Intersight deployment.
- **52:** 1 Gb/hour means bits, not bytes. Ten cameras × 336 hours ÷ eight = 420 GB decimal before overhead. The former 3.36 TB value would require 1 GB/hour instead.
- **53, 54:** CNP priority queueing and PFC priority pause are distinct mechanisms. Neither is a universal guarantee of zero loss or bounded latency; end-to-end ECN, headroom and supported endpoint configuration matter.
- **60:** the hardware reference establishes six 3000 W GPU-sled PSUs but does not prove actual Power Save firmware behavior at a 4500 W load. The question is explicitly reframed as a capacity exercise with two additional non-standby reserve units. Two standby units follows from those stated assumptions only; it is not vendor-verified operational advice.

## Evidence

The four source files `scripts/ai-study-content/ccnp-dcai-037-042.mjs` through `ccnp-dcai-055-060.mjs` record per-question source URLs, supported claims and review notes. The corresponding primary documents were inspected during authoring. Important references include:

- [Cisco Hyperfabric data sheet](https://www.cisco.com/c/en/us/products/collateral/data-center-networking/nexus-hyperfabric/nexus-hyperfabric-ds.html) and [full-stack AI data sheet](https://www.cisco.com/c/en/us/products/collateral/data-center-networking/nexus-hyperfabric/nexus-hyperfabric-ai-ds.html).
- [Intersight deep-dive installation walkthrough](https://www.cisco.com/c/en/us/customer-success/video/webinar/deep-dive-on-cisco-intersight-part-2.html) and [C845A operations guide](https://www.cisco.com/c/en/us/products/collateral/servers-unified-computing/ucs-c-series-rack-servers/ucs-c845a-m8-rack-server-og.html).
- [Nexus Dashboard 4.3.1 analytics prerequisites](https://www.cisco.com/c/en/us/td/docs/dcn/nd/4x/articles-431/analyzing-and-troubleshooting-your-network.html), [NX-OS 10.6 GPO microsegmentation](https://www.cisco.com/c/en/us/td/docs/dcn/nx-os/nexus9000/106x/configuration/vxlan/cisco-nexus-9000-series-nx-os-vxlan-configuration-guide-release-106x/microsegmentation_for_vxlan_fabrics_using_gpo.html).
- [NVIDIA System Management Interface metric definitions](https://docs.nvidia.com/deploy/nvidia-smi/index.html), [Cisco C885A hardware overview](https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/c/hw/c885A/install/b_c885a-m8-server-hig/m_overview.html).

## Validation and remaining work

The complete compiler gate has zero pending IDs. Regression coverage includes all 172 scored questions across learning, feedback, mistakes and results; no pre-submission answer/reference leakage; all four illustrated disclosures; corrected option/stem propagation; and practice/exam plus persisted-record regrading for DCAI 26, 49 and 57 without crossing bank boundaries. Dedicated sizing checks preserve units and the explicit Q60 model limitation.

AI modules, knowledge maps and review helpers, final browser acceptance and production accounts/Turnstile remain separate release requirements. This content batch alone is not the completed user goal and is not a production release.
