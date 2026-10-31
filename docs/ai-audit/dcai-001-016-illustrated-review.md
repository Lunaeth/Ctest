# DCAI initial scored batch and illustrated questions

Reviewed on 2026-10-30. This batch adds scored IDs 2, 4, 5, 6, 8, 9, 10, 12, 13, 15, 16 and illustrated IDs 3, 11, 29, 36. IDs 1, 7 and 14 were already authored. DCAI coverage is now 18/60; AIIO remains 116/116. The remaining 42 DCAI questions, feature parity and production accounts are not complete.

## Substantive corrections

- **4 — IPv4 RoCEv2:** added the missing IPv4 scope and replaced the claim that fragmentation inherently breaks IB sequence numbering. DF prevents router fragmentation; it does not guarantee delivery, negotiate an optimal MTU or pin an ECMP path. The original stem and option D remain stored. Evidence: CERN's RoCE presentation slide 4 and RFC 8900 section 2.2.
- **5 — DCQCN:** the original generic “Quantized Congestion Notification” wording was misleading. The stem now explicitly names DCQCN and RoCEv2. The switch marks ECN, the receiver returns CNP and the sender adapts its rate. ECN-first/PFC-backstop behavior depends on threshold design, not an invariant ordering for every burst. C remains correct.
- **10 — VAST:** clarified C225 M8 EBox storage nodes versus GPU compute nodes, and removed an unbounded exabyte-performance implication. DASE/EBox identifies VAST; other storage products are not declared incapable of AI. A current Cisco CVD contains an inconsistent “shared-nothing” phrase; the Cisco/VAST data sheet and ACI white paper corroborate DASE as shared-everything.
- **16 — ACI:** scoped the question to the RoCE storage-data QoS class. The VAST guide uses different policies for control-plane and default traffic, so a blanket claim about all VAST traffic is wrong. A remains correct.
- **3 — DLB matching:** verified the utilization exhibit, candidate image and answer image. Added the missing assumption that per-packet reordering capability has not been established. `dlb / all / flowlet` remains the answer; `per-packet` is a valid alternative under explicitly supported endpoint/platform conditions. The snippet is not a complete deployment procedure.
- **36 — congestion matching:** original “incast” and “bursty sender” labels do not uniquely distinguish ECN and PFC. Text prompts now specify end-to-end rate feedback versus immediate hop-by-hop pause. The answer remains ECN then PFC. Corrected the claim about AFD: the Cisco blueprint explicitly describes AFD ECN marking, so it must not be taught as inherently incompatible with lossless RoCE. The original images and stem remain available.

## Other verified distinctions

- **2:** Always On controls power restoration; High controls allocation preference. Neither makes OS boot instantaneous. CPU PPL is not a restart-priority control.
- **6:** structured language extraction is an NLP use case; not all NLP outputs are structured, and ordinary deduplication does not inherently need NLP.
- **8:** Platinum/no-drop is the documented Intersight procedure, not a universal RoCE priority value. Traffic classification, PFC and MTU must align end to end.
- **9:** spines interconnect scalable units in the specified rail design; adding switches does not automatically provide nonblocking bandwidth.
- **11:** matched backend/frontend/storage/management to the four original target descriptions. Logical roles need not occupy four separate physical fabrics; Cisco's design converges frontend and storage.
- **12:** Hyperfabric `outPfcPps` records transmitted PFC packets/s. It is a relevant congestion signal, not a standalone diagnosis or packet-loss count.
- **13:** workload distribution provides cross-location compute placement; tightly coupled jobs may still need co-located resources.
- **15:** reconcile DNS in the Network Connectivity policy associated with the deployed FI domain profile; NTP has its own policy. A chassis policy is the wrong scope.
- **29:** matched Control→CDP/LLDP, Group→allowed/native VLANs, QoS→MTU/rate, Adapter→VXLAN/RoCE. Ethernet Network is unused in this FI-attached vNIC context. Feature membership in a policy is not proof that all features can run together.

Each authored entry contains the exact primary-reference URLs, a claim-support note, individual bilingual candidate explanations, memory aid, pitfall, reasoning steps and terminology. Some old Cisco IMM documentation URLs now redirect to a short migration notice; those empty pages were not accepted as technical evidence.

## Rendering and validation

The compiler now handles illustrated reviews without inventing a multiple-choice key. All four remain outside scored exams. The review page shows bilingual candidate and target text; mappings, every candidate explanation, study aids, sources and original answer images stay in a closed disclosure. Source images were visually inspected during this review.

Automated tests cover all four reviews, unused candidates, escaping, no answer leakage outside disclosures, retained source wording, the clarified scored stems and cross-view rendering. The complete JavaScript suite is run before committing. Compiler output is checked for repeat-build identity.

Browser reconnection was attempted twice for the updated page; both inventory calls timed out. This batch therefore has no new rendered-browser acceptance evidence. Browser QA remains pending and is not inferred from string-rendering tests.

No production or GitHub release of this partial audit has been performed. The independent ca portal and learn app deployment remain on 8815039.
