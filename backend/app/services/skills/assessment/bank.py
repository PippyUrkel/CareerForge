"""Internal Question Bank for Technical Skill Assessments.

Provides high-quality, categorized multiple-choice questions mapped to internal skills,
subtopics, and explicit difficulty levels (1=Beginner, 2=Intermediate, 3=Advanced).
"""

from __future__ import annotations

from app.services.skills.assessment.models import AssessmentQuestion, QuestionOption


INTERNAL_QUESTION_BANK: list[AssessmentQuestion] = [
    # ─────────────────────────────────────────────────────────────
    # PYTHON PROGRAMMING (skill_python)
    # ─────────────────────────────────────────────────────────────
    AssessmentQuestion(
        question_id="py_beg_01",
        question_text="What is the result of evaluating `bool([])` and `bool([0])` in Python?",
        options=[
            QuestionOption(id="a", text="True and True"),
            QuestionOption(id="b", text="False and True"),
            QuestionOption(id="c", text="False and False"),
            QuestionOption(id="d", text="True and False"),
        ],
        correct_answer="b",
        skill_id="skill_python",
        topic_id="truthiness",
        difficulty=1,
        weight=1.0,
        explanation="In Python, empty sequences like empty lists evaluate to False in a boolean context, whereas a non-empty sequence containing any element (even 0) evaluates to True.",
    ),
    AssessmentQuestion(
        question_id="py_beg_02",
        question_text="Which Python built-in method creates a shallow copy of a dictionary `d`?",
        options=[
            QuestionOption(id="a", text="d.copy()"),
            QuestionOption(id="b", text="d.clone()"),
            QuestionOption(id="c", text="copy(d)"),
            QuestionOption(id="d", text="d.duplicate()"),
        ],
        correct_answer="a",
        skill_id="skill_python",
        topic_id="data_structures",
        difficulty=1,
        weight=1.0,
        explanation="Dictionaries in Python have a built-in `.copy()` method that produces a shallow copy of the dictionary mapping.",
    ),
    AssessmentQuestion(
        question_id="py_int_01",
        question_text="In Python, what is the primary behavior difference between a generator function using `yield` and a standard function returning a list?",
        options=[
            QuestionOption(id="a", text="Generators run on a separate OS thread, preventing the GIL from blocking execution"),
            QuestionOption(id="b", text="Generators evaluate values lazily on-demand, maintaining minimal memory footprint (O(1) memory)"),
            QuestionOption(id="c", text="Generators can only yield immutable primitive types"),
            QuestionOption(id="d", text="Generators serialize the return object to disk automatically"),
        ],
        correct_answer="b",
        skill_id="skill_python",
        topic_id="generators",
        difficulty=2,
        weight=1.5,
        explanation="Generator functions produce an iterator that computes items one at a time upon iteration (lazy evaluation), allowing processing of infinite or large sequences with constant memory.",
    ),
    AssessmentQuestion(
        question_id="py_int_02",
        question_text="How does Python's method resolution order (MRO) resolve multiple inheritance conflicts?",
        options=[
            QuestionOption(id="a", text="Depth-first search traversing strictly from left to right"),
            QuestionOption(id="b", text="C3 Linearization algorithm preserving local precedence order and monotonicity"),
            QuestionOption(id="c", text="Random selection based on class hash keys"),
            QuestionOption(id="d", text="Breadth-first search traversing all base classes before child methods"),
        ],
        correct_answer="b",
        skill_id="skill_python",
        topic_id="oop_mro",
        difficulty=2,
        weight=1.5,
        explanation="Python uses the C3 Linearization algorithm to determine Method Resolution Order, guaranteeing that subclasses precede parent classes and multiple inheritance order is preserved without cycles.",
    ),
    AssessmentQuestion(
        question_id="py_adv_01",
        question_text="When writing asynchronous code in Python with `asyncio`, what occurs if a CPU-bound operation is run synchronously inside a coroutine without `asyncio.to_thread` or an executor?",
        options=[
            QuestionOption(id="a", text="The asyncio event loop automatically spawns a worker thread to handle the load"),
            QuestionOption(id="b", text="The entire event loop is blocked, freezing execution of all other concurrent coroutines"),
            QuestionOption(id="c", text="The GIL is released immediately and preemptive scheduling begins"),
            QuestionOption(id="d", text="An unhandled `BlockedLoopException` is raised by Python"),
        ],
        correct_answer="b",
        skill_id="skill_python",
        topic_id="asyncio_concurrency",
        difficulty=3,
        weight=2.0,
        explanation="Python's asyncio event loop is single-threaded and cooperative. Blocking CPU-bound or synchronous I/O operations stall the event loop, starving all other scheduled tasks from running.",
    ),
    AssessmentQuestion(
        question_id="py_adv_02",
        question_text="What does Python's `__slots__` attribute accomplish when defined in a class?",
        options=[
            QuestionOption(id="a", text="It forces all class methods to be compiled down to C-extensions via Cython"),
            QuestionOption(id="b", text="It suppresses the automatic creation of `__dict__` and `__weakref__`, significantly reducing per-instance memory allocation"),
            QuestionOption(id="c", text="It automatically synchronizes thread-safe access to instance attributes"),
            QuestionOption(id="d", text="It enables static type validation at runtime whenever attributes are modified"),
        ],
        correct_answer="b",
        skill_id="skill_python",
        topic_id="metaprogramming_memory",
        difficulty=3,
        weight=2.0,
        explanation="Defining `__slots__` explicitly tells Python not to create a dynamic `__dict__` dictionary for each instance, storing attributes in fixed descriptor slots and saving substantial RAM for large instance counts.",
    ),

    # ─────────────────────────────────────────────────────────────
    # SQL & RELATIONAL DATABASES (skill_sql)
    # ─────────────────────────────────────────────────────────────
    AssessmentQuestion(
        question_id="sql_beg_01",
        question_text="Which SQL clause is used to filter records aggregated by a `GROUP BY` clause?",
        options=[
            QuestionOption(id="a", text="WHERE"),
            QuestionOption(id="b", text="HAVING"),
            QuestionOption(id="c", text="FILTER"),
            QuestionOption(id="d", text="ORDER BY"),
        ],
        correct_answer="b",
        skill_id="skill_sql",
        topic_id="query_clauses",
        difficulty=1,
        weight=1.0,
        explanation="The `HAVING` clause is specifically evaluated after aggregation to filter groups, whereas `WHERE` filters rows before grouping.",
    ),
    AssessmentQuestion(
        question_id="sql_beg_02",
        question_text="What is the result of a `LEFT JOIN` when a record in the left table has no matching foreign key in the right table?",
        options=[
            QuestionOption(id="a", text="The row is excluded from the query results"),
            QuestionOption(id="b", text="The row is retained with NULL values for the right table columns"),
            QuestionOption(id="c", text="A foreign key constraint violation error is thrown"),
            QuestionOption(id="d", text="The row is duplicated for all right table values"),
        ],
        correct_answer="b",
        skill_id="skill_sql",
        topic_id="joins",
        difficulty=1,
        weight=1.0,
        explanation="A `LEFT JOIN` preserves all records from the left table, populating right-table fields with `NULL` where no match exists.",
    ),
    AssessmentQuestion(
        question_id="sql_int_01",
        question_text="In a B-Tree index on columns `(user_id, status, created_at)`, which of the following queries can efficiently utilize the index?",
        options=[
            QuestionOption(id="a", text="WHERE created_at > '2026-01-01'"),
            QuestionOption(id="b", text="WHERE status = 'ACTIVE' AND created_at > '2026-01-01'"),
            QuestionOption(id="c", text="WHERE user_id = 42 AND status = 'ACTIVE'"),
            QuestionOption(id="d", text="WHERE status = 'ACTIVE'"),
        ],
        correct_answer="c",
        skill_id="skill_sql",
        topic_id="indexing",
        difficulty=2,
        weight=1.5,
        explanation="Composite B-Tree indexes require the query predicate to match a leading prefix of the index columns. Filtering on `user_id` and `status` satisfies the leading prefix `(user_id, status)`.",
    ),
    AssessmentQuestion(
        question_id="sql_int_02",
        question_text="What does the 'I' in the ACID transaction model guarantee?",
        options=[
            QuestionOption(id="a", text="Integrity: data never violates schema check constraints"),
            QuestionOption(id="b", text="Idempotence: running the transaction twice produces identical outputs"),
            QuestionOption(id="c", text="Isolation: concurrent transactions execute without interfering with one another's intermediate states"),
            QuestionOption(id="d", text="Immutable: committed records can never be updated or deleted"),
        ],
        correct_answer="c",
        skill_id="skill_sql",
        topic_id="acid_transactions",
        difficulty=2,
        weight=1.5,
        explanation="Isolation ensures that concurrent transactions operate as if executed serially, preventing anomalies like dirty reads, non-repeatable reads, or phantom reads depending on isolation level.",
    ),
    AssessmentQuestion(
        question_id="sql_adv_01",
        question_text="Under PostgreSQL's MVCC (Multi-Version Concurrency Control), what phenomenon occurs when a row is updated?",
        options=[
            QuestionOption(id="a", text="The row is updated in-place with an exclusive table lock"),
            QuestionOption(id="b", text="A new row tuple version is inserted with updated `xmin` and the old tuple is marked with `xmax`"),
            QuestionOption(id="c", text="The entire table page is duplicated in RAM and swapped asynchronously"),
            QuestionOption(id="d", text="The update is written strictly to the WAL and never stored in table pages"),
        ],
        correct_answer="b",
        skill_id="skill_sql",
        topic_id="mvcc_internals",
        difficulty=3,
        weight=2.0,
        explanation="PostgreSQL MVCC writes a new tuple version for updates with transaction IDs (`xmin`/`xmax`), allowing readers to access snapshot versions without blocking writers.",
    ),

    # ─────────────────────────────────────────────────────────────
    # DOCKER & CONTAINERIZATION (skill_docker)
    # ─────────────────────────────────────────────────────────────
    AssessmentQuestion(
        question_id="doc_beg_01",
        question_text="What is the key difference between a Docker image and a Docker container?",
        options=[
            QuestionOption(id="a", text="An image is a running process; a container is a static configuration file"),
            QuestionOption(id="b", text="An image is a read-only immutable blueprint; a container is a runnable, isolated instance with a writable layer"),
            QuestionOption(id="c", text="Images can only run on Linux, while containers run on any OS"),
            QuestionOption(id="d", text="There is no difference; the terms are synonymous in Docker"),
        ],
        correct_answer="b",
        skill_id="skill_docker",
        topic_id="container_basics",
        difficulty=1,
        weight=1.0,
        explanation="Docker images are immutable, multi-layered templates. Containers are live execution instances of images with their own namespace and thin read-write layer.",
    ),
    AssessmentQuestion(
        question_id="doc_int_01",
        question_text="Why are multi-stage Docker builds widely used in production continuous deployment?",
        options=[
            QuestionOption(id="a", text="They allow running multiple web servers inside a single container"),
            QuestionOption(id="b", text="They separate the compilation/build environment from the final runtime image, drastically reducing image size and attack surface"),
            QuestionOption(id="c", text="They bypass the Linux container namespace restrictions"),
            QuestionOption(id="d", text="They eliminate the need for container registries"),
        ],
        correct_answer="b",
        skill_id="skill_docker",
        topic_id="dockerfile_optimization",
        difficulty=2,
        weight=1.5,
        explanation="Multi-stage builds permit copying only compiled artifacts into a lightweight, stripped runtime image (like Alpine or distroless), omitting heavy compilers and dev dependencies.",
    ),
    AssessmentQuestion(
        question_id="doc_adv_01",
        question_text="Which Linux kernel primitives form the technical foundation of Docker container isolation?",
        options=[
            QuestionOption(id="a", text="KVM and QEMU hypervisor virtualization"),
            QuestionOption(id="b", text="Namespaces (for isolation) and cgroups (for resource limiting and metering)"),
            QuestionOption(id="c", text="systemd and SELinux policies alone"),
            QuestionOption(id="d", text="eBPF programs and iptables routing"),
        ],
        correct_answer="b",
        skill_id="skill_docker",
        topic_id="kernel_internals",
        difficulty=3,
        weight=2.0,
        explanation="Containers utilize Linux kernel namespaces (PID, NET, MNT, IPC, UTS, USER) to provide isolation and Control Groups (cgroups) to meter and throttle CPU, memory, and I/O usage.",
    ),

    # ─────────────────────────────────────────────────────────────
    # REST APIS & HTTP (skill_rest_apis)
    # ─────────────────────────────────────────────────────────────
    AssessmentQuestion(
        question_id="api_beg_01",
        question_text="Which HTTP status code should be returned when a resource is successfully created via a `POST` request?",
        options=[
            QuestionOption(id="a", text="200 OK"),
            QuestionOption(id="b", text="201 Created"),
            QuestionOption(id="c", text="204 No Content"),
            QuestionOption(id="d", text="202 Accepted"),
        ],
        correct_answer="b",
        skill_id="skill_rest_apis",
        topic_id="http_status_codes",
        difficulty=1,
        weight=1.0,
        explanation="HTTP 201 Created is the standard REST status code confirming that a new resource was created, typically accompanied by a `Location` header.",
    ),
    AssessmentQuestion(
        question_id="api_int_01",
        question_text="What does it mean for an HTTP method to be 'idempotent' in REST architecture?",
        options=[
            QuestionOption(id="a", text="The request completes in constant O(1) time"),
            QuestionOption(id="b", text="Making the identical request multiple times produces the same intended system side-effects as a single request"),
            QuestionOption(id="c", text="The method never modifies server state (read-only)"),
            QuestionOption(id="d", text="The request cannot be cached by intermediate proxies"),
        ],
        correct_answer="b",
        skill_id="skill_rest_apis",
        topic_id="idempotency",
        difficulty=2,
        weight=1.5,
        explanation="Idempotency means that executing multiple identical requests has the same effect on the server as executing it once. Methods like GET, PUT, and DELETE are idempotent; POST is not.",
    ),
    AssessmentQuestion(
        question_id="api_adv_01",
        question_text="When designing rate-limiting for high-throughput APIs, what advantage does the 'Token Bucket' algorithm offer over a fixed-window counter?",
        options=[
            QuestionOption(id="a", text="It requires zero memory storage on the server"),
            QuestionOption(id="b", text="It allows controlled bursts of traffic up to the bucket capacity while maintaining a steady long-term rate"),
            QuestionOption(id="c", text="It prevents all distributed denial of service attacks automatically"),
            QuestionOption(id="d", text="It encrypts the payload headers using asymmetric keys"),
        ],
        correct_answer="b",
        skill_id="skill_rest_apis",
        topic_id="rate_limiting_architecture",
        difficulty=3,
        weight=2.0,
        explanation="Token bucket allows accumulating tokens to handle legitimate brief bursts up to the capacity threshold, while replenishing tokens at a constant rate, unlike rigid fixed-window counters that suffer from boundary reset spikes.",
    ),

    # ─────────────────────────────────────────────────────────────
    # SOFTWARE TESTING & QA (skill_testing)
    # ─────────────────────────────────────────────────────────────
    AssessmentQuestion(
        question_id="test_beg_01",
        question_text="In software testing, what is the primary purpose of a unit test?",
        options=[
            QuestionOption(id="a", text="To evaluate end-to-end user journeys through the browser UI"),
            QuestionOption(id="b", text="To verify that an individual function or class method behaves correctly in isolation"),
            QuestionOption(id="c", text="To test database query execution speed under heavy multi-client load"),
            QuestionOption(id="d", text="To verify that deployed cloud infrastructure scales automatically"),
        ],
        correct_answer="b",
        skill_id="skill_testing",
        topic_id="unit_testing_basics",
        difficulty=1,
        weight=1.0,
        explanation="Unit tests isolate a single component, function, or class to verify correctness of logic without external network, database, or UI dependencies.",
    ),
    AssessmentQuestion(
        question_id="test_int_01",
        question_text="What is the fundamental difference between a 'Stub' and a 'Mock' in automated test suites?",
        options=[
            QuestionOption(id="a", text="Stubs are only used in frontend tests; mocks are only used in backend tests"),
            QuestionOption(id="b", text="A stub provides canned data to calls made during the test; a mock additionally verifies expectations about method call counts and arguments"),
            QuestionOption(id="c", text="Mocks run in production; stubs run only in local development"),
            QuestionOption(id="d", text="There is no difference; both terms are completely interchangeable"),
        ],
        correct_answer="b",
        skill_id="skill_testing",
        topic_id="test_doubles",
        difficulty=2,
        weight=1.5,
        explanation="Stubs supply predetermined answers to calls during test execution. Mocks record and assert behavioral expectations, verifying that expected methods were called with specific arguments.",
    ),
    AssessmentQuestion(
        question_id="test_adv_01",
        question_text="How does Property-Based Testing (e.g. using Hypothesis in Python) differ from traditional Example-Based unit testing?",
        options=[
            QuestionOption(id="a", text="It only tests CSS property layouts on web pages"),
            QuestionOption(id="b", text="It generates hundreds of randomized edge-case inputs to falsify invariant assertions, then automatically shrinks failures to minimal counterexamples"),
            QuestionOption(id="c", text="It runs tests in parallel across GPUs instead of CPUs"),
            QuestionOption(id="d", text="It uses an LLM to generate synthetic mock objects"),
        ],
        correct_answer="b",
        skill_id="skill_testing",
        topic_id="property_testing",
        difficulty=3,
        weight=2.0,
        explanation="Property-based testing specifies invariant properties that must hold true across all valid inputs. The framework generates pseudo-random inputs (boundary values, nulls, unicode) and shrinks failing cases to the minimal reproducible example.",
    ),

    # ─────────────────────────────────────────────────────────────
    # DISTRIBUTED SYSTEMS & SYSTEM DESIGN (skill_system_design)
    # ─────────────────────────────────────────────────────────────
    AssessmentQuestion(
        question_id="sys_beg_01",
        question_text="What does 'Horizontal Scaling' mean in server infrastructure design?",
        options=[
            QuestionOption(id="a", text="Upgrading a single machine with more CPU cores and RAM"),
            QuestionOption(id="b", text="Adding more server nodes to distribute incoming requests across a cluster"),
            QuestionOption(id="c", text="Compressing images and static assets across a CDN"),
            QuestionOption(id="d", text="Switching from SQL to NoSQL datastores"),
        ],
        correct_answer="b",
        skill_id="skill_system_design",
        topic_id="scaling_fundamentals",
        difficulty=1,
        weight=1.0,
        explanation="Horizontal scaling (scaling out) adds more machines/nodes into a pool, whereas vertical scaling (scaling up) upgrades the hardware capacity of a single machine.",
    ),
    AssessmentQuestion(
        question_id="sys_int_01",
        question_text="According to the CAP Theorem, when a network partition (P) occurs in a distributed data store, what trade-off must the system make?",
        options=[
            QuestionOption(id="a", text="Choose between Consistency (C) and Availability (A)"),
            QuestionOption(id="b", text="Choose between Security and Latency"),
            QuestionOption(id="c", text="Choose between ACID transactions and BASE semantics"),
            QuestionOption(id="d", text="Both Consistency and Availability are always maintained seamlessly"),
        ],
        correct_answer="a",
        skill_id="skill_system_design",
        topic_id="cap_theorem",
        difficulty=2,
        weight=1.5,
        explanation="In the presence of a network partition (P), a distributed system cannot maintain both Consistency (every read receives the latest write) and Availability (every non-failing node returns a response). It must choose CP or AP.",
    ),
    AssessmentQuestion(
        question_id="sys_adv_01",
        question_text="In high-throughput event-driven microservices, how does the 'Transactional Outbox' pattern prevent dual-write inconsistencies between a database and a message broker (e.g. Kafka)?",
        options=[
            QuestionOption(id="a", text="It forces the message broker to handle two-phase commits across all microservices"),
            QuestionOption(id="b", text="It writes the event to an outbox table within the same local DB transaction as the business entity, then a CDC or poller relay publishes to the broker asynchronously"),
            QuestionOption(id="c", text="It skips database writes when message broker queues are saturated"),
            QuestionOption(id="d", text="It encrypts Kafka messages using hardware security modules"),
        ],
        correct_answer="b",
        skill_id="skill_system_design",
        topic_id="transactional_outbox",
        difficulty=3,
        weight=2.0,
        explanation="The Transactional Outbox pattern guarantees at-least-once delivery by atomically persisting both the entity state and the outgoing event in the same ACID database transaction, decoupling the network publish step via a reliable CDC (Change Data Capture) relay.",
    ),

    # ─────────────────────────────────────────────────────────────
    # VECTOR DATABASES & AI RETRIEVAL (skill_vector_db)
    # ─────────────────────────────────────────────────────────────
    AssessmentQuestion(
        question_id="vec_beg_01",
        question_text="What does a vector embedding represent in modern machine learning and retrieval systems?",
        options=[
            QuestionOption(id="a", text="An encrypted password hash generated by SHA-256"),
            QuestionOption(id="b", text="A dense array of floating-point numbers encoding semantic relationships in high-dimensional space"),
            QuestionOption(id="c", text="A binary image format used for web browser rendering"),
            QuestionOption(id="d", text="A database index containing primary key pointers"),
        ],
        correct_answer="b",
        skill_id="skill_vector_db",
        topic_id="embedding_fundamentals",
        difficulty=1,
        weight=1.0,
        explanation="Vector embeddings map words, documents, or media into dense numerical vectors where semantically similar items reside close to each other in vector space.",
    ),
    AssessmentQuestion(
        question_id="vec_int_01",
        question_text="Why is HNSW (Hierarchical Navigable Small World) frequently chosen over brute-force kNN for vector retrieval in production?",
        options=[
            QuestionOption(id="a", text="It guarantees 100% exact nearest neighbor recall on every query"),
            QuestionOption(id="b", text="It offers logarithmic O(log N) approximate nearest neighbor search by constructing a multi-layer proximity graph"),
            QuestionOption(id="c", text="It eliminates the need for vector dimensions larger than 16"),
            QuestionOption(id="d", text="It stores vectors uncompressed on SSD without memory usage"),
        ],
        correct_answer="b",
        skill_id="skill_vector_db",
        topic_id="approximate_nearest_neighbors",
        difficulty=2,
        weight=1.5,
        explanation="HNSW builds a hierarchical skip-list-like graph where upper layers have long-range links and lower layers have dense local links, enabling sub-linear O(log N) approximate search latency with very high recall.",
    ),
    AssessmentQuestion(
        question_id="vec_adv_01",
        question_text="In hybrid search systems combining dense vector cosine similarity with BM25 keyword search, how does Reciprocal Rank Fusion (RRF) merge the rank lists?",
        options=[
            QuestionOption(id="a", text="It multiplies the raw vector dot product by the BM25 floating-point score"),
            QuestionOption(id="b", text="It scores items based on `1 / (k + rank)`, making it invariant to differing score distributions and scales across engines"),
            QuestionOption(id="c", text="It strictly discards any document not appearing in the top 3 of both lists"),
            QuestionOption(id="d", text="It converts all documents to TF-IDF bag-of-words vectors"),
        ],
        correct_answer="b",
        skill_id="skill_vector_db",
        topic_id="hybrid_search_rrf",
        difficulty=3,
        weight=2.0,
        explanation="RRF computes `sum(1 / (k + r))` across multiple result rankings where `k` is a smoothing constant (typically 60). Because it relies purely on ranks rather than raw uncalibrated scores, it robustly blends dense and sparse search outputs.",
    ),

    # ─────────────────────────────────────────────────────────────
    # GIT & WORKFLOWS (skill_git)
    # ─────────────────────────────────────────────────────────────
    AssessmentQuestion(
        question_id="git_beg_01",
        question_text="What does the command `git checkout -b feature-login` accomplish?",
        options=[
            QuestionOption(id="a", text="Deletes the branch named feature-login"),
            QuestionOption(id="b", text="Creates a new branch named feature-login and switches HEAD to it"),
            QuestionOption(id="c", text="Rolls back the last commit on the current branch"),
            QuestionOption(id="d", text="Pushes local changes to the remote repository"),
        ],
        correct_answer="b",
        skill_id="skill_git",
        topic_id="branching",
        difficulty=1,
        weight=1.0,
        explanation="The `-b` flag tells Git to create the branch if it doesn't already exist and immediately switch the working directory HEAD to it.",
    ),
    AssessmentQuestion(
        question_id="git_int_01",
        question_text="What is the key functional difference between `git rebase main` and `git merge main` when integrating upstream changes into your feature branch?",
        options=[
            QuestionOption(id="a", text="Rebase creates a 3-way merge commit, while merge rewrites commit history"),
            QuestionOption(id="b", text="Rebase reapplies your feature branch commits sequentially on top of main's latest commit, maintaining a clean linear history"),
            QuestionOption(id="c", text="Merge deletes all previous commits on the feature branch"),
            QuestionOption(id="d", text="Rebase permanently locks the remote Git repository"),
        ],
        correct_answer="b",
        skill_id="skill_git",
        topic_id="rebase_vs_merge",
        difficulty=2,
        weight=1.5,
        explanation="Rebasing unwinds your commits, updates the base to the target branch tip, and replays each of your commits on top with new hashes, yielding a linear history without unnecessary merge commits.",
    ),
    AssessmentQuestion(
        question_id="git_adv_01",
        question_text="When would an engineer choose `git cherry-pick -x <commit-hash>`?",
        options=[
            QuestionOption(id="a", text="To delete a corrupted branch from remote origin"),
            QuestionOption(id="b", text="To apply the changes introduced by a specific existing commit onto the current working HEAD, recording the original commit hash in the message"),
            QuestionOption(id="c", text="To squash all feature commits into a single commit"),
            QuestionOption(id="d", text="To revert an uncommitted change in the working directory"),
        ],
        correct_answer="b",
        skill_id="skill_git",
        topic_id="cherry_pick",
        difficulty=3,
        weight=2.0,
        explanation="`git cherry-pick` selects a single commit from another branch and applies its patch onto HEAD. The `-x` flag automatically appends a line indicating '(cherry picked from commit ...)' for auditability.",
    ),
]


# Dynamic question registry for questions scraped or generated on the fly from Mercer Mettl, TestGorilla, SHL, HackerRank, CodeSignal
DYNAMIC_QUESTIONS_REGISTRY: dict[str, AssessmentQuestion] = {}


def register_dynamic_questions(questions: list[AssessmentQuestion]) -> None:
    """Register dynamically scraped or synthesized questions so scoring engine can resolve them."""
    for q in questions:
        DYNAMIC_QUESTIONS_REGISTRY[q.question_id] = q


def get_questions_for_skill(
    skill_id: str,
    difficulties: list[int] | None = None,
    limit: int = 5,
) -> list[AssessmentQuestion]:
    """Retrieve filtered questions for a specific skill and difficulty levels."""
    all_available = INTERNAL_QUESTION_BANK + list(DYNAMIC_QUESTIONS_REGISTRY.values())
    matches = [q for q in all_available if q.skill_id == skill_id]
    if difficulties:
        matches = [q for q in matches if q.difficulty in difficulties]
    return matches[:limit]


def get_question_by_id(question_id: str) -> AssessmentQuestion | None:
    """Retrieve question by its ID from both internal bank and dynamic registry."""
    if question_id in DYNAMIC_QUESTIONS_REGISTRY:
        return DYNAMIC_QUESTIONS_REGISTRY[question_id]
    for q in INTERNAL_QUESTION_BANK:
        if q.question_id == question_id:
            return q
    return None
