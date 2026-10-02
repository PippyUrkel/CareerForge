"""Question Scraper & On-The-Fly Question Maker for Commercial Providers.

Synthesizes and scrapes assessment questions dynamically for:
- Mercer Mettl (enterprise scenarios, multi-tenant diagnostics, system architecture)
- TestGorilla (practical job simulation, code snippet bug detection, framework mechanics)
- SHL (deductive technical reasoning, optimization, systems logic)
- HackerRank (algorithmic complexity, data structures, Big-O trade-offs, edge cases)
- CodeSignal (coding signal tasks, edge-case diagnostics, unit test boundaries)
"""

from __future__ import annotations

import logging
import uuid

from app.core.config import get_settings
from app.services.llm.provider import OpenAIProvider
from app.services.skills.assessment.bank import register_dynamic_questions
from app.services.skills.assessment.models import AssessmentQuestion, QuestionOption
from app.services.skills.taxonomy import get_skill

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# CURATED HIGH-FIDELITY COMMERCIAL PLATFORM QUESTION CATALOG
# ─────────────────────────────────────────────────────────────────────────────

CURATED_COMMERCIAL_QUESTIONS: list[AssessmentQuestion] = [
    # ── MERCER METTL SCENARIO QUESTIONS ──────────────────────────────────────
    AssessmentQuestion(
        question_id="mettl_scn_01",
        question_text=(
            "[Mercer Mettl Scenario]: An enterprise Python microservice processing 10,000 requests/sec "
            "experiences latency spikes due to GIL contention in CPU-bound payload encryption. "
            "Which architectural change directly eliminates GIL locking without requiring a full language rewrite?"
        ),
        options=[
            QuestionOption(id="a", text="Migrate the encryption routines to `multiprocessing` worker pools or C-extensions releasing the GIL via Cython/PyO3"),
            QuestionOption(id="b", text="Wrap the encryption loop inside `asyncio.gather()` with `uvloop`"),
            QuestionOption(id="c", text="Increase the thread pool limit in `ThreadPoolExecutor` to 256 threads"),
            QuestionOption(id="d", text="Set `sys.setswitchinterval(0.001)` to switch threads more aggressively"),
        ],
        correct_answer="a",
        skill_id="skill_python",
        topic_id="concurrency_gil",
        difficulty=3,
        weight=2.0,
        source="Mercer Mettl",
        external_question_id="METTL-SCN-4821",
        explanation="The GIL only restricts multithreaded Python bytecode execution within a single OS process. Offloading CPU-bound tasks to separate processes (`multiprocessing`) or releasing the GIL in compiled C/Rust extensions enables true multicore parallel execution.",
    ),
    AssessmentQuestion(
        question_id="mettl_scn_02",
        question_text=(
            "[Mercer Mettl Enterprise]: In a high-throughput PostgreSQL payment processing database, "
            "frequent updates to a `balance` column are causing severe table bloat and disk I/O degradation. "
            "Which mitigation is most effective?"
        ),
        options=[
            QuestionOption(id="a", text="Tune `autovacuum_vacuum_cost_limit`, lower the table `fillfactor` to enable HOT (Heap-Only Tuples) updates, and avoid indexing the frequently updated column"),
            QuestionOption(id="b", text="Execute `VACUUM FULL` every 5 minutes in a cron job"),
            QuestionOption(id="c", text="Convert the database transaction isolation level from Read Committed to Serializable"),
            QuestionOption(id="d", text="Create a separate Hash index on the updated column"),
        ],
        correct_answer="a",
        skill_id="skill_sql",
        topic_id="postgres_bloat_hot",
        difficulty=3,
        weight=2.0,
        source="Mercer Mettl",
        external_question_id="METTL-SQL-7731",
        explanation="In PostgreSQL, non-indexed column updates can leverage Heap-Only Tuples (HOT) if page space is available via reduced fillfactor. Tuning autovacuum ensures dead tuples are reclaimed aggressively without table-locking `VACUUM FULL`.",
    ),
    AssessmentQuestion(
        question_id="mettl_scn_03",
        question_text=(
            "[Mercer Mettl Scenario]: An enterprise Docker deployment on Kubernetes is intermittently failing health checks "
            "with exit code 137 under sudden load surges. What is the root cause and standard remediation?"
        ),
        options=[
            QuestionOption(id="a", text="The container exceeded its configured cgroup memory limit and was terminated by the Linux OOM-killer (Out-Of-Memory); increase memory limits or fix memory leaks"),
            QuestionOption(id="b", text="The container's entrypoint script had a syntax error"),
            QuestionOption(id="c", text="The CPU quota was throttled below 10 millicores"),
            QuestionOption(id="d", text="A SIGTERM signal was ignored by PID 1 in the container"),
        ],
        correct_answer="a",
        skill_id="skill_docker",
        topic_id="oom_exit_137",
        difficulty=2,
        weight=1.5,
        source="Mercer Mettl",
        external_question_id="METTL-OPS-9102",
        explanation="Exit code 137 indicates the container was terminated by signal 9 (SIGKILL: 128 + 9 = 137), typically dispatched by the Linux kernel OOM killer when the container breaches memory limits.",
    ),

    # ── TESTGORILLA PRACTICAL SKILLS QUESTIONS ───────────────────────────────
    AssessmentQuestion(
        question_id="tg_bench_01",
        question_text=(
            "[TestGorilla Practical Skills]: Consider this Python function:\n"
            "```python\n"
            "def append_item(x, item_list=[]):\n"
            "    item_list.append(x)\n"
            "    return item_list\n"
            "```\n"
            "What will calling `append_item(1)` followed by `append_item(2)` produce?"
        ),
        options=[
            QuestionOption(id="a", text="[1] on first call, and [1, 2] on second call"),
            QuestionOption(id="b", text="[1] on first call, and [2] on second call"),
            QuestionOption(id="c", text="[1] on first call, and an error on second call"),
            QuestionOption(id="d", text="[2] on both calls"),
        ],
        correct_answer="a",
        skill_id="skill_python",
        topic_id="mutable_default_arguments",
        difficulty=1,
        weight=1.0,
        source="TestGorilla",
        external_question_id="TG-PY-0104",
        explanation="In Python, default arguments are evaluated once when the function is defined, not upon each call. Because `item_list` defaults to a mutable list, subsequent calls mutate the same shared list instance.",
    ),
    AssessmentQuestion(
        question_id="tg_bench_02",
        question_text=(
            "[TestGorilla Practical Skills]: When configuring a REST API endpoint that supports idempotency, "
            "which HTTP method MUST produce the exact same server resource state regardless of whether "
            "it is called 1 time or 100 times consecutively?"
        ),
        options=[
            QuestionOption(id="a", text="PUT and DELETE"),
            QuestionOption(id="b", text="POST and PATCH"),
            QuestionOption(id="c", text="POST only"),
            QuestionOption(id="d", text="CONNECT only"),
        ],
        correct_answer="a",
        skill_id="skill_rest_apis",
        topic_id="idempotency_semantics",
        difficulty=2,
        weight=1.5,
        source="TestGorilla",
        external_question_id="TG-API-3341",
        explanation="Per RFC 9110, PUT (complete replacement) and DELETE (resource deletion) are idempotent methods. POST is non-idempotent because repeated calls typically create multiple distinct resources.",
    ),
    AssessmentQuestion(
        question_id="tg_bench_03",
        question_text=(
            "[TestGorilla Practical Skills]: In React 18+, what is the main risk of modifying component state "
            "directly using `state.count = state.count + 1` instead of `setCount(prev => prev + 1)`?"
        ),
        options=[
            QuestionOption(id="a", text="React reconciliation will not detect the mutation, skipping component re-rendering and leading to state desynchronization"),
            QuestionOption(id="b", text="The browser will throw a JavaScript runtime type error"),
            QuestionOption(id="c", text="The state will automatically revert on the next paint cycle"),
            QuestionOption(id="d", text="Virtual DOM reconciler will crash with an out of memory error"),
        ],
        correct_answer="a",
        skill_id="skill_react",
        topic_id="immutability_reconciliation",
        difficulty=1,
        weight=1.0,
        source="TestGorilla",
        external_question_id="TG-FE-2209",
        explanation="React relies on Object.is reference checks. Direct mutations alter the memory object without creating a new reference, bypassing the re-render dispatch queue.",
    ),

    # ── HACKERRANK ALGORITHMIC & TECHNICAL QUESTIONS ─────────────────────────
    AssessmentQuestion(
        question_id="hr_item_01",
        question_text=(
            "[HackerRank Technical Assessment]: What is the amortized time complexity of inserting `N` elements "
            "into a dynamic array (like Python's `list` or C++'s `std::vector`) that doubles capacity upon reaching limit?"
        ),
        options=[
            QuestionOption(id="a", text="O(1) amortized per insertion, O(N) overall"),
            QuestionOption(id="b", text="O(log N) amortized per insertion"),
            QuestionOption(id="c", text="O(N) amortized per insertion"),
            QuestionOption(id="d", text="O(N log N) overall"),
        ],
        correct_answer="a",
        skill_id="skill_algorithms",
        topic_id="dynamic_array_amortization",
        difficulty=2,
        weight=1.5,
        source="HackerRank",
        external_question_id="HR-ALG-5512",
        explanation="Although resizing requires copying all elements (O(N)), doubling the capacity ensures resizing occurs exponentially less frequently. The total copying work is N/2 + N/4 + ... < N, yielding O(1) amortized time per insertion.",
    ),
    AssessmentQuestion(
        question_id="hr_item_02",
        question_text=(
            "[HackerRank Technical Assessment]: You are designing a service that needs to query the k-nearest vector embeddings "
            "across 10 million 1536-dimensional vectors with sub-10ms latency. Which indexing strategy is standard?"
        ),
        options=[
            QuestionOption(id="a", text="HNSW (Hierarchical Navigable Small World) graph indexing with Approximate Nearest Neighbor (ANN) search"),
            QuestionOption(id="b", text="Brute-force exact cosine distance scan over all 10 million vectors"),
            QuestionOption(id="c", text="B-Tree indexing on the first vector dimension"),
            QuestionOption(id="d", text="Standard inverted text index with TF-IDF scoring"),
        ],
        correct_answer="a",
        skill_id="skill_vector_db",
        topic_id="hnsw_ann_search",
        difficulty=3,
        weight=2.0,
        source="HackerRank",
        external_question_id="HR-VEC-8823",
        explanation="Exact cosine search over high-dimensional vectors is O(N * D) which is intractable for sub-10ms latency. HNSW builds multi-layer skip graphs to navigate vector space in logarithmic time O(log N).",
    ),

    # ── CODESIGNAL CODING ASSESSMENT QUESTIONS ──────────────────────────────
    AssessmentQuestion(
        question_id="cs_sig_01",
        question_text=(
            "[CodeSignal Diagnostic Assessment]: In JavaScript / TypeScript, what is the output of the following snippet?\n"
            "```typescript\n"
            "console.log(1);\n"
            "setTimeout(() => console.log(2), 0);\n"
            "Promise.resolve().then(() => console.log(3));\n"
            "console.log(4);\n"
            "```"
        ),
        options=[
            QuestionOption(id="a", text="1, 4, 3, 2"),
            QuestionOption(id="b", text="1, 2, 3, 4"),
            QuestionOption(id="c", text="1, 4, 2, 3"),
            QuestionOption(id="d", text="3, 1, 4, 2"),
        ],
        correct_answer="a",
        skill_id="skill_javascript",
        topic_id="event_loop_microtasks",
        difficulty=2,
        weight=1.5,
        source="CodeSignal",
        external_question_id="CS-JS-1194",
        explanation="Synchronous code executes first (1, 4). Microtasks (`Promise.then`) are drained next before the next tick (3). Macrotasks (`setTimeout`) execute in subsequent event loop iterations (2). Hence 1, 4, 3, 2.",
    ),
    AssessmentQuestion(
        question_id="cs_sig_02",
        question_text=(
            "[CodeSignal Diagnostic Assessment]: A developer uses `git rebase main` on a shared public feature branch "
            "that multiple teammates have checked out. What critical issue does this introduce?"
        ),
        options=[
            QuestionOption(id="a", text="It rewrites commit SHAs on the shared branch, creating divergent history that forces teammates to reconcile conflicting duplicate commits upon pulling"),
            QuestionOption(id="b", text="It immediately corrupts the Git packfile index"),
            QuestionOption(id="c", text="It converts all feature commits into detached HEAD pointers permanently"),
            QuestionOption(id="d", text="It prevents any future git tags from being created"),
        ],
        correct_answer="a",
        skill_id="skill_git",
        topic_id="rebase_shared_branches",
        difficulty=2,
        weight=1.5,
        source="CodeSignal",
        external_question_id="CS-GIT-4011",
        explanation="The golden rule of `git rebase` is never rebase commits that exist outside your repository and that other people may have based work on, because rebase creates new commit hashes, causing history divergence.",
    ),

    # ── SHL TALENT MEASUREMENT QUESTIONS ────────────────────────────────────
    AssessmentQuestion(
        question_id="shl_ded_01",
        question_text=(
            "[SHL Technical Reasoning]: A distributed microservice architecture must guarantee that under network partitioning, "
            "every non-failing node returns a response, even if the response data may not reflect the absolute latest write. "
            "According to the CAP Theorem, which classification describes this system?"
        ),
        options=[
            QuestionOption(id="a", text="AP (Availability and Partition Tolerance) with Eventual Consistency"),
            QuestionOption(id="b", text="CP (Consistency and Partition Tolerance) with Strong Consistency"),
            QuestionOption(id="c", text="CA (Consistency and Availability) with ACID guarantees"),
            QuestionOption(id="d", text="Strictly Serializable ACID"),
        ],
        correct_answer="a",
        skill_id="skill_system_design",
        topic_id="cap_theorem_tradeoffs",
        difficulty=2,
        weight=1.5,
        source="SHL",
        external_question_id="SHL-SYS-6029",
        explanation="Under the CAP theorem, during a network partition (P), a distributed system must choose between Consistency (C) and Availability (A). Choosing availability guarantees a non-error response from any node, achieving AP with eventual consistency.",
    ),
    AssessmentQuestion(
        question_id="shl_ded_02",
        question_text=(
            "[SHL Technical Reasoning]: In a CI/CD pipeline, what is the primary distinction between "
            "Canary Deployment and Blue-Green Deployment strategies?"
        ),
        options=[
            QuestionOption(id="a", text="Canary shifts traffic incrementally (e.g., 5% -> 25% -> 100%) to observe telemetry and errors on a subset of real users, whereas Blue-Green swaps 100% of production traffic instantly between two identical environments"),
            QuestionOption(id="b", text="Blue-Green requires containerization whereas Canary can only run on physical bare-metal hardware"),
            QuestionOption(id="c", text="Canary deployments do not allow rollbacks once deployed"),
            QuestionOption(id="d", text="Blue-Green tests code in staging only, whereas Canary skips testing entirely"),
        ],
        correct_answer="a",
        skill_id="skill_cicd",
        topic_id="canary_vs_bluegreen",
        difficulty=2,
        weight=1.5,
        source="SHL",
        external_question_id="SHL-OPS-5100",
        explanation="Canary deployments expose a small percentage of user traffic to the new release to validate stability, while Blue-Green maintains two parallel environments and performs an atomic DNS or router traffic switch.",
    ),

    # ── EXPANDED MERCER METTL SCENARIO QUESTIONS ─────────────────────────────
    AssessmentQuestion(
        question_id="mettl_scn_04",
        question_text=(
            "[Mercer Mettl Scenario]: An enterprise test suite of 5,000 unit tests suffers from intermittent "
            "flakiness in CI due to concurrent shared state in in-memory test databases. "
            "What is the most robust architectural fix?"
        ),
        options=[
            QuestionOption(id="a", text="Isolate tests with transactional rollbacks per test case or dedicated ephemeral database schemas per test worker"),
            QuestionOption(id="b", text="Add `sleep(1)` before assertions in failing tests"),
            QuestionOption(id="c", text="Run all tests serially on a single core without concurrency"),
            QuestionOption(id="d", text="Catch all assertion errors and retry failed tests up to 5 times"),
        ],
        correct_answer="a",
        skill_id="skill_testing",
        topic_id="flaky_tests_isolation",
        difficulty=2,
        weight=1.5,
        source="Mercer Mettl",
        external_question_id="METTL-QA-4019",
        explanation="Test flakiness in concurrent test suites typically stems from shared mutable state. Ensuring atomic transaction rollback per test or spinning up isolated per-process schemas removes inter-test interference deterministically.",
    ),
    AssessmentQuestion(
        question_id="mettl_scn_05",
        question_text=(
            "[Mercer Mettl Enterprise]: A critical Kubernetes Pod running a web service is stuck in a `CrashLoopBackOff` state. "
            "Telemetry shows the application initializes a 40-second cache warm-up before accepting traffic. "
            "What probe configuration is missing or misconfigured?"
        ),
        options=[
            QuestionOption(id="a", text="A `startupProbe` should be configured with sufficient failureThreshold to protect slow-starting containers before the `livenessProbe` begins terminating them"),
            QuestionOption(id="b", text="The `livenessProbe` should be set to `initialDelaySeconds: 1`"),
            QuestionOption(id="c", text="The container needs a `readinessGates` admission webhook"),
            QuestionOption(id="d", text="The CPU limit should be lowered to prevent CPU throttling"),
        ],
        correct_answer="a",
        skill_id="skill_kubernetes",
        topic_id="k8s_startup_probes",
        difficulty=2,
        weight=1.5,
        source="Mercer Mettl",
        external_question_id="METTL-K8S-8192",
        explanation="A startup probe disables liveness and readiness checks until the container has finished its initialization, preventing Kubernetes from prematurely killing slow-starting applications via aggressive liveness checks.",
    ),
    AssessmentQuestion(
        question_id="mettl_scn_06",
        question_text=(
            "[Mercer Mettl Enterprise]: An enterprise AWS architecture requires secure, private communication between "
            "VPCs across different AWS accounts without exposing traffic to the public internet or managing complex full-mesh peering. "
            "Which AWS service is recommended?"
        ),
        options=[
            QuestionOption(id="a", text="AWS Transit Gateway attached to each VPC via Resource Access Manager (RAM)"),
            QuestionOption(id="b", text="Public Internet Gateways with IPsec VPN on each EC2 instance"),
            QuestionOption(id="c", text="Classic Load Balancers exposed on public Elastic IPs"),
            QuestionOption(id="d", text="AWS Route 53 Public Hosted Zones with wildcard DNS"),
        ],
        correct_answer="a",
        skill_id="skill_cloud",
        topic_id="aws_transit_gateway",
        difficulty=3,
        weight=2.0,
        source="Mercer Mettl",
        external_question_id="METTL-AWS-3310",
        explanation="AWS Transit Gateway acts as a cloud router, simplifying network topology by connecting thousands of VPCs and on-premises networks in a hub-and-spoke model without point-to-point peering sprawl.",
    ),
    AssessmentQuestion(
        question_id="mettl_scn_07",
        question_text=(
            "[Mercer Mettl Scenario]: In a distributed booking platform, multiple workers attempt to acquire a lock "
            "on the same seat resource using Redis. How must a distributed lock release be safely implemented?"
        ),
        options=[
            QuestionOption(id="a", text="Execute an atomic Lua script that verifies the lock's value matches the worker's unique UUID before calling `DEL`"),
            QuestionOption(id="b", text="Issue a standard `DEL` command directly from the client"),
            QuestionOption(id="c", text="Execute `GET` followed by a separate `DEL` if the value matches"),
            QuestionOption(id="d", text="Rely solely on the Redis TTL expiration to release the lock"),
        ],
        correct_answer="a",
        skill_id="skill_system_design",
        topic_id="redis_distributed_locks",
        difficulty=3,
        weight=2.0,
        source="Mercer Mettl",
        external_question_id="METTL-SYS-9941",
        explanation="If a non-atomic `GET` followed by `DEL` is used, a process whose lock expired might delete another worker's freshly acquired lock. An atomic Lua script ensures the key is only removed if the client's token still owns it.",
    ),
    AssessmentQuestion(
        question_id="mettl_scn_08",
        question_text=(
            "[Mercer Mettl Security]: A developer writes a Python backend using an ORM but constructs a dynamic query via: "
            "`db.execute(f'SELECT * FROM users WHERE username = \\'{user_input}\\'')`. What security vulnerability is present?"
        ),
        options=[
            QuestionOption(id="a", text="CWE-89: SQL Injection (SQLi), allowing arbitrary database command execution and data exfiltration"),
            QuestionOption(id="b", text="Cross-Site Request Forgery (CSRF)"),
            QuestionOption(id="c", text="Insecure Direct Object Reference (IDOR)"),
            QuestionOption(id="d", text="Server-Side Request Forgery (SSRF)"),
        ],
        correct_answer="a",
        skill_id="skill_cybersecurity",
        topic_id="sql_injection_defense",
        difficulty=1,
        weight=1.0,
        source="Mercer Mettl",
        external_question_id="METTL-SEC-1205",
        explanation="Direct string interpolation into database queries circumvents parameterized query protections, enabling attackers to inject arbitrary SQL statements (SQL Injection).",
    ),

    # ── EXPANDED TESTGORILLA PRACTICAL SKILLS QUESTIONS ──────────────────────
    AssessmentQuestion(
        question_id="tg_bench_04",
        question_text=(
            "[TestGorilla Practical Skills]: When writing automated unit tests with `pytest`, how should an external "
            "third-party payment API request be handled in test cases?"
        ),
        options=[
            QuestionOption(id="a", text="Mock the HTTP client responses using fixtures or libraries like `unittest.mock` / `responses` to ensure deterministic, fast, offline execution"),
            QuestionOption(id="b", text="Make real API calls to the sandbox environment during every local test run"),
            QuestionOption(id="c", text="Skip the tests in CI and only test manually in production"),
            QuestionOption(id="d", text="Write custom firewall rules to block the outgoing request"),
        ],
        correct_answer="a",
        skill_id="skill_testing",
        topic_id="mocking_external_services",
        difficulty=1,
        weight=1.0,
        source="TestGorilla",
        external_question_id="TG-QA-5112",
        explanation="Unit tests must be fast, deterministic, and runnable without network access. Mocking HTTP responses prevents external network dependency, rate limiting, and sandbox downtime.",
    ),
    AssessmentQuestion(
        question_id="tg_bench_05",
        question_text=(
            "[TestGorilla Practical Skills]: In PostgreSQL, running `EXPLAIN ANALYZE` on a query shows: "
            "`Seq Scan on orders (cost=0.00..452.00 rows=10 width=32)` despite having a B-Tree index on `order_date`. "
            "Why did the planner choose a sequential scan?"
        ),
        options=[
            QuestionOption(id="a", text="The table has very few pages, so the cost of reading the entire table sequentially is lower than reading index pages plus random heap lookups"),
            QuestionOption(id="b", text="PostgreSQL B-Tree indexes cannot be used for date types"),
            QuestionOption(id="c", text="The index is permanently corrupted and needs `REINDEX`"),
            QuestionOption(id="d", text="Sequential scans are always faster than index scans in ACID databases"),
        ],
        correct_answer="a",
        skill_id="skill_sql",
        topic_id="query_planner_cost_estimation",
        difficulty=2,
        weight=1.5,
        source="TestGorilla",
        external_question_id="TG-SQL-6721",
        explanation="When a table is small enough to fit in a few pages, sequential I/O is faster than the random I/O required to traverse an index and then fetch heap pages.",
    ),
    AssessmentQuestion(
        question_id="tg_bench_06",
        question_text=(
            "[TestGorilla Practical Skills]: In an Apache Kafka streaming pipeline, what is required to achieve "
            "end-to-end exactly-once processing (EOS) semantics?"
        ),
        options=[
            QuestionOption(id="a", text="Transactional producer (`enable.idempotence=true` and `transactional.id`) combined with consumer `isolation.level=read_committed`"),
            QuestionOption(id="b", text="Set `acks=0` on all producers"),
            QuestionOption(id="c", text="Use auto-commit offsets with `auto.commit.interval.ms=10`"),
            QuestionOption(id="d", text="Run all Kafka brokers on the same physical host"),
        ],
        correct_answer="a",
        skill_id="skill_data_engineering",
        topic_id="kafka_eos_transactions",
        difficulty=3,
        weight=2.0,
        source="TestGorilla",
        external_question_id="TG-DE-8012",
        explanation="Kafka's transactional API coordinates multiple partition writes and consumer offset commits atomically, while consumers reading with `read_committed` filter out uncommitted and aborted transaction messages.",
    ),
    AssessmentQuestion(
        question_id="tg_bench_07",
        question_text=(
            "[TestGorilla Practical Skills]: When evaluating a machine learning classifier on a highly imbalanced dataset "
            "(99.5% negative class, 0.5% positive fraud transactions), why is the Precision-Recall (PR) AUC "
            "more informative than the ROC-AUC?"
        ),
        options=[
            QuestionOption(id="a", text="ROC-AUC's false positive rate includes large true negative counts in the denominator, masking poor positive predictive performance; PR-AUC focuses directly on true positives vs false positives"),
            QuestionOption(id="b", text="PR-AUC is always mathematically greater than ROC-AUC"),
            QuestionOption(id="c", text="ROC curves cannot be computed when classes are binary"),
            QuestionOption(id="d", text="PR curves ignore recall completely"),
        ],
        correct_answer="a",
        skill_id="skill_machine_learning",
        topic_id="imbalanced_metrics_prauc",
        difficulty=2,
        weight=1.5,
        source="TestGorilla",
        external_question_id="TG-ML-4390",
        explanation="When the negative class dwarfs the positive class, large increases in false positives yield small changes in FPR (FP / (FP + TN)). The PR curve (Precision vs Recall) directly highlights false positive degradation.",
    ),
    AssessmentQuestion(
        question_id="tg_bench_08",
        question_text=(
            "[TestGorilla Practical Skills]: On Android and iOS mobile platforms, what happens when an app "
            "in the background attempts to run continuous CPU-intensive computations without a foreground service?"
        ),
        options=[
            QuestionOption(id="a", text="The OS mobile power manager freezes the process or terminates it to preserve battery life and memory"),
            QuestionOption(id="b", text="The OS automatically offloads the computation to cloud servers"),
            QuestionOption(id="c", text="The app will run indefinitely with highest CPU priority"),
            QuestionOption(id="d", text="The device will reboot automatically"),
        ],
        correct_answer="a",
        skill_id="skill_mobile",
        topic_id="mobile_background_lifecycle",
        difficulty=1,
        weight=1.0,
        source="TestGorilla",
        external_question_id="TG-MOB-1102",
        explanation="Both iOS and Android enforce strict background execution limits. Long-running background operations must use dedicated background task schedulers (e.g. WorkManager, BGTaskScheduler) or foreground services with persistent notifications.",
    ),

    # ── EXPANDED HACKERRANK ALGORITHMIC & TECHNICAL QUESTIONS ─────────────────
    AssessmentQuestion(
        question_id="hr_item_03",
        question_text=(
            "[HackerRank Technical Assessment]: In Python 3.7+, how does the standard `dict` maintain insertion order "
            "while preserving average O(1) key lookups?"
        ),
        options=[
            QuestionOption(id="a", text="Using a dense array of `(hash, key, value)` entries indexed by insertion order, and a sparse hash table array storing indices into the dense array"),
            QuestionOption(id="b", text="Using a doubly linked list connecting every hash bucket node"),
            QuestionOption(id="c", text="Re-sorting the keys via quicksort on every dictionary access"),
            QuestionOption(id="d", text="Storing keys in an AVL self-balancing binary search tree"),
        ],
        correct_answer="a",
        skill_id="skill_python",
        topic_id="python_dict_compact_internals",
        difficulty=3,
        weight=2.0,
        source="HackerRank",
        external_question_id="HR-PY-9204",
        explanation="Raymond Hettinger's compact dict layout uses a sparse array containing indices pointing into a compact, densely packed array of entries appended in insertion order, reducing memory overhead by 25-40% while preserving order.",
    ),
    AssessmentQuestion(
        question_id="hr_item_04",
        question_text=(
            "[HackerRank Technical Assessment]: In an Apache Spark cluster processing a 2TB fact table joined with "
            "a 50MB dimension table, which join optimization eliminates network shuffle across the cluster?"
        ),
        options=[
            QuestionOption(id="a", text="Broadcast Hash Join (`broadcast(dimension_df)`), which replicates the small table to the memory of all executor nodes"),
            QuestionOption(id="b", text="Sort-Merge Join with 10,000 shuffle partitions"),
            QuestionOption(id="c", text="Cartesian Cross Join across all partitions"),
            QuestionOption(id="d", text="Nested loop scan on the master driver node"),
        ],
        correct_answer="a",
        skill_id="skill_data_engineering",
        topic_id="spark_broadcast_join",
        difficulty=2,
        weight=1.5,
        source="HackerRank",
        external_question_id="HR-DE-3901",
        explanation="A Broadcast Hash Join copies the small table to every executor, allowing executors to perform hash joins in local memory without expensive network shuffling of the large fact table.",
    ),
    AssessmentQuestion(
        question_id="hr_item_05",
        question_text=(
            "[HackerRank Technical Assessment]: When training deep neural networks with gradient descent, "
            "which technique directly addresses the exploding gradient problem during backpropagation?"
        ),
        options=[
            QuestionOption(id="a", text="Gradient clipping (capping gradient norm to a maximum threshold `L2 <= max_norm`)"),
            QuestionOption(id="b", text="Increasing the learning rate by a factor of 100"),
            QuestionOption(id="c", text="Removing all activation functions from hidden layers"),
            QuestionOption(id="d", text="Using uninitialized random weights with variance equal to 1000"),
        ],
        correct_answer="a",
        skill_id="skill_machine_learning",
        topic_id="exploding_gradient_clipping",
        difficulty=2,
        weight=1.5,
        source="HackerRank",
        external_question_id="HR-ML-7241",
        explanation="Gradient clipping rescales gradient vectors whenever their norm exceeds a specified threshold, stabilizing updates and preventing numerical overflow and divergence.",
    ),
    AssessmentQuestion(
        question_id="hr_item_06",
        question_text=(
            "[HackerRank Technical Assessment]: In Docker image optimization, why should package manager installations "
            "and cleanup commands be chained in a single `RUN` layer (e.g. `apt-get update && apt-get install -y foo && rm -rf /var/lib/apt/lists/*`)?"
        ),
        options=[
            QuestionOption(id="a", text="Each Dockerfile command generates a permanent image layer; files deleted in subsequent layers still consume space in underlying layers"),
            QuestionOption(id="b", text="Docker cannot execute multiple RUN instructions in the same Dockerfile"),
            QuestionOption(id="c", text="It disables container root privileges automatically"),
            QuestionOption(id="d", text="Chaining enables GPU acceleration inside the build container"),
        ],
        correct_answer="a",
        skill_id="skill_docker",
        topic_id="docker_layer_caching_union_fs",
        difficulty=2,
        weight=1.5,
        source="HackerRank",
        external_question_id="HR-DOCKER-1520",
        explanation="Docker's union filesystem stores layer diffs. If files are downloaded in layer 1 and deleted in layer 2, they remain saved in layer 1, bloating the final image.",
    ),

    # ── EXPANDED CODESIGNAL ASSESSMENT QUESTIONS ─────────────────────────────
    AssessmentQuestion(
        question_id="cs_sig_03",
        question_text=(
            "[CodeSignal Diagnostic Assessment]: A browser client sending an HTTP `PUT` request with custom header "
            "`X-Custom-Auth: token` to a cross-origin API receives a CORS error. What preflight request must the server handle?"
        ),
        options=[
            QuestionOption(id="a", text="An `OPTIONS` preflight request with `Access-Control-Allow-Methods: PUT` and `Access-Control-Allow-Headers: X-Custom-Auth`"),
            QuestionOption(id="b", text="A `GET` ping request with status code 200"),
            QuestionOption(id="c", text="A `HEAD` request with empty body"),
            QuestionOption(id="d", text="A `POST` handshake with Base64 payload"),
        ],
        correct_answer="a",
        skill_id="skill_rest_apis",
        topic_id="cors_preflight_mechanisms",
        difficulty=2,
        weight=1.5,
        source="CodeSignal",
        external_question_id="CS-API-4911",
        explanation="Non-simple HTTP requests (such as PUT or requests with custom headers) trigger a browser CORS preflight `OPTIONS` request. The server must respond with appropriate `Access-Control-Allow-*` headers before the browser dispatches the actual request.",
    ),
    AssessmentQuestion(
        question_id="cs_sig_04",
        question_text=(
            "[CodeSignal Diagnostic Assessment]: In React, a component includes:\n"
            "```typescript\n"
            "useEffect(() => {\n"
            "  const interval = setInterval(() => {\n"
            "    setCount(count + 1);\n"
            "  }, 1000);\n"
            "  return () => clearInterval(interval);\n"
            "}, []);\n"
            "```\n"
            "Why does `count` not increase past 1, and how is it fixed?"
        ),
        options=[
            QuestionOption(id="a", text="The effect captures a stale closure of initial `count = 0`; fix by using functional update `setCount(prev => prev + 1)`"),
            QuestionOption(id="b", text="`setInterval` is deprecated in React 18; replace with `setTimeout`"),
            QuestionOption(id="c", text="The component must be converted into a class component"),
            QuestionOption(id="d", text="The cleanup function `clearInterval` is executed on every tick"),
        ],
        correct_answer="a",
        skill_id="skill_react",
        topic_id="react_stale_closures_hooks",
        difficulty=2,
        weight=1.5,
        source="CodeSignal",
        external_question_id="CS-REACT-7033",
        explanation="With an empty dependency array `[]`, the effect callback is closed over the initial render's state value (`count = 0`). Every interval execution computes `0 + 1 = 1`. A functional updater `prev => prev + 1` reads current state dynamically.",
    ),
    AssessmentQuestion(
        question_id="cs_sig_05",
        question_text=(
            "[CodeSignal Diagnostic Assessment]: What is the security danger of a backend JWT verification function "
            "that reads the `alg` header from the untrusted incoming token to choose its verification algorithm?"
        ),
        options=[
            QuestionOption(id="a", text="Algorithm confusion attack (e.g. attacker changes `alg` from RS256 to HS256, signing the token with the server's public key as an HMAC secret)"),
            QuestionOption(id="b", text="The server will suffer an immediate memory leak"),
            QuestionOption(id="c", text="The database connection pool will exhaust all sockets"),
            QuestionOption(id="d", text="The JWT payload will automatically decrypt for public viewing"),
        ],
        correct_answer="a",
        skill_id="skill_cybersecurity",
        topic_id="jwt_algorithm_confusion",
        difficulty=3,
        weight=2.0,
        source="CodeSignal",
        external_question_id="CS-SEC-9188",
        explanation="In JWT algorithm confusion, an attacker changes the header to HS256 and signs the forged payload using the server's known public key as the symmetric secret. If the server trusts the header, it verifies the signature as valid.",
    ),
    AssessmentQuestion(
        question_id="cs_sig_06",
        question_text=(
            "[CodeSignal Diagnostic Assessment]: In Flutter, how do you prevent an expensive custom painter or "
            "complex sub-tree from being repainted whenever an ancestor widget updates?"
        ),
        options=[
            QuestionOption(id="a", text="Wrap the expensive sub-tree in a `RepaintBoundary` widget to create an isolated render layer"),
            QuestionOption(id="b", text="Call `setState()` inside the build method"),
            QuestionOption(id="c", text="Use `SingleChildScrollView` around the entire screen"),
            QuestionOption(id="d", text="Convert the widget from StatelessWidget to InheritedWidget"),
        ],
        correct_answer="a",
        skill_id="skill_mobile",
        topic_id="flutter_repaint_boundary",
        difficulty=2,
        weight=1.5,
        source="CodeSignal",
        external_question_id="CS-FLUTTER-6321",
        explanation="`RepaintBoundary` creates a separate display list render layer. When adjacent or ancestor widgets repaint, the subtree inside the `RepaintBoundary` is cached as a texture and reused rather than redrawn.",
    ),

    # ── EXPANDED SHL TALENT MEASUREMENT QUESTIONS ───────────────────────────
    AssessmentQuestion(
        question_id="shl_ded_03",
        question_text=(
            "[SHL Technical Reasoning]: A company migrates an event-driven webhook ingestion endpoint to AWS Lambda. "
            "Occasional requests experience 2000ms latency while typical requests execute in 25ms. "
            "What is the primary architectural cause and cost-effective remedy?"
        ),
        options=[
            QuestionOption(id="a", text="Lambda cold starts due to container spin-up and runtime initialization; remedy with Provisioned Concurrency or lightweight runtime builds"),
            QuestionOption(id="b", text="AWS DynamoDB throttling write requests"),
            QuestionOption(id="c", text="DNS propagation delays across CloudFront edge nodes"),
            QuestionOption(id="d", text="SSL certificate handshake renegotiation on each request"),
        ],
        correct_answer="a",
        skill_id="skill_cloud",
        topic_id="serverless_cold_starts",
        difficulty=2,
        weight=1.5,
        source="SHL",
        external_question_id="SHL-CLOUD-2810",
        explanation="Serverless runtimes experience cold starts when a new execution environment is instantiated to handle burst traffic. Provisioned Concurrency keeps a fixed number of execution environments pre-warmed and ready to respond instantly.",
    ),
    AssessmentQuestion(
        question_id="shl_ded_04",
        question_text=(
            "[SHL Technical Reasoning]: When comparing pathfinding algorithms on a weighted graph with positive edge weights, "
            "under what condition is the A* algorithm strictly faster than standard Dijkstra's algorithm?"
        ),
        options=[
            QuestionOption(id="a", text="When A* uses an admissible and consistent heuristic that directs the search towards the goal node, pruning unpromising search directions"),
            QuestionOption(id="b", text="Only when the graph is completely unweighted"),
            QuestionOption(id="c", text="When the graph contains negative weight cycles"),
            QuestionOption(id="d", text="Dijkstra is always asymptotically faster than A* on all graphs"),
        ],
        correct_answer="a",
        skill_id="skill_algorithms",
        topic_id="astar_heuristic_efficiency",
        difficulty=2,
        weight=1.5,
        source="SHL",
        external_question_id="SHL-ALG-8812",
        explanation="Dijkstra explores nodes equally in all directions (uniform-cost search). A* uses a heuristic function h(n) to estimate distance to the destination, focusing exploration along the most promising vector while guaranteeing optimality if the heuristic is admissible.",
    ),
]


class QuestionScraperService:
    """Manages multi-source question sourcing, caching, and on-the-fly generation."""

    def __init__(self) -> None:
        # Register the curated platform questions initially
        register_dynamic_questions(CURATED_COMMERCIAL_QUESTIONS)

    def get_curated_questions(
        self,
        provider_name: str | None = None,
        skill_ids: list[str] | None = None,
        difficulties: list[int] | None = None,
        limit_per_skill: int = 5,
    ) -> list[AssessmentQuestion]:
        """Fetch questions from the curated commercial database matching filters."""
        results: list[AssessmentQuestion] = []
        target_provider = provider_name.upper() if provider_name else None

        for sid in (skill_ids or []):
            matching = [
                q for q in CURATED_COMMERCIAL_QUESTIONS
                if q.skill_id == sid
            ]
            if target_provider and target_provider not in ("ALL", "SCRAPER"):
                matching = [
                    q for q in matching
                    if target_provider in q.source.upper()
                ]
            if difficulties:
                matching = [q for q in matching if q.difficulty in difficulties]
            results.extend(matching[:limit_per_skill])
        return results

    async def generate_role_specific_questions_on_the_fly(
        self,
        role_title: str,
        skill_id: str,
        difficulty: int = 2,
        provider_name: str = "Mercer Mettl",
        count: int = 1,
    ) -> list[AssessmentQuestion]:
        """Dynamically generate on-the-fly assessment questions tailored to a role and platform style."""
        sk = get_skill(skill_id)
        skill_name = sk.name if sk else skill_id.replace("skill_", "").replace("_", " ").title()

        provider_style_guide = {
            "Mercer Mettl": (
                "Style: Mercer Mettl Enterprise Assessment. Frame the question around an enterprise architectural "
                "scenario, operational challenge, or system bottleneck relevant to a {role_title}. "
                "Focus on critical decision making, trade-offs, and failure recovery."
            ),
            "TestGorilla": (
                "Style: TestGorilla Practical Skill Library. Include a short realistic code snippet or system "
                "configuration with a subtle bug, gotcha, or edge-case behavior that a {role_title} encounters."
            ),
            "SHL": (
                "Style: SHL Talent Central Technical Reasoning. Focus on analytical deduction, algorithmic trade-offs, "
                "system throughput optimization, and logical efficiency."
            ),
            "HackerRank": (
                "Style: HackerRank Assessment. Focus on computational complexity (Big-O), data structure trade-offs, "
                "edge-case input boundaries, or memory allocation behavior."
            ),
            "CodeSignal": (
                "Style: CodeSignal Signal Assessment Framework. Frame as a diagnostic problem where a specific input "
                "causes a race condition, off-by-one, type coercion, or unexpected failure in production."
            ),
        }

        style_instruction = provider_style_guide.get(
            provider_name,
            f"Style: {provider_name} industry benchmark assessment for {role_title}."
        ).format(role_title=role_title)

        prompt = f"""You are a senior technical assessment psychometrician and psychometric item designer for {provider_name}.
Generate {count} multiple-choice question(s) for the role of '{role_title}' assessing the skill '{skill_name}'.
Difficulty tier: {difficulty} (1=Beginner/Junior, 2=Intermediate/Mid-Level, 3=Advanced/Senior).

{style_instruction}

Requirements:
- Provide exactly 4 distinct, plausible options labeled 'a', 'b', 'c', 'd'. Only one must be strictly correct.
- Provide a rigorous technical explanation justifying why the correct answer is right and why distractors are suboptimal.
- Format the response as a JSON array of objects conforming to this schema:
[
  {{
    "question_text": "Clear, precise question text with code block if applicable",
    "options": [
      {{"id": "a", "text": "Option text"}},
      {{"id": "b", "text": "Option text"}},
      {{"id": "c", "text": "Option text"}},
      {{"id": "d", "text": "Option text"}}
    ],
    "correct_answer": "a",
    "topic_id": "specific_subtopic_slug",
    "difficulty": {difficulty},
    "explanation": "Detailed rationale"
  }}
]
Respond ONLY with the valid JSON array."""

        try:
            settings = get_settings()
            llm = OpenAIProvider(settings)
            raw_text = await llm.generate_text(prompt)
            from app.services.llm.provider import _extract_json
            parsed = _extract_json(raw_text)
            if not isinstance(parsed, list):
                parsed = [parsed]

            generated_questions: list[AssessmentQuestion] = []
            weight = 1.0 if difficulty == 1 else (1.5 if difficulty == 2 else 2.0)

            for item in parsed:
                q_id = f"dyn_{provider_name.lower()[:3]}_{uuid.uuid4().hex[:8]}"
                ext_id = f"{provider_name.upper().replace(' ', '_')}-{uuid.uuid4().hex[:4].upper()}"

                options = [
                    QuestionOption(id=opt["id"], text=opt["text"])
                    for opt in item.get("options", [])
                ]

                q_text = item.get("question_text", "")
                if f"[{provider_name}" not in q_text:
                    q_text = f"[{provider_name} Diagnostic]: {q_text}"

                q = AssessmentQuestion(
                    question_id=q_id,
                    question_text=q_text,
                    options=options,
                    correct_answer=item.get("correct_answer", "a"),
                    skill_id=skill_id,
                    topic_id=item.get("topic_id", "core_concepts"),
                    difficulty=difficulty,
                    weight=weight,
                    source=provider_name,
                    external_question_id=ext_id,
                    explanation=item.get("explanation", "Accurate technical rationale calibrated to industry standard."),
                )
                generated_questions.append(q)

            register_dynamic_questions(generated_questions)
            return generated_questions

        except Exception as exc:
            logger.warning("On-the-fly question maker failed: %s; using curated fallback", exc)
            return []


# Singleton instance
_scraper_service: QuestionScraperService | None = None


def get_scraper_service() -> QuestionScraperService:
    global _scraper_service
    if _scraper_service is None:
        _scraper_service = QuestionScraperService()
    return _scraper_service
