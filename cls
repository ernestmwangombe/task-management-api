[33mcommit 7c42061588fa4f4c25b7c189eac7835e3cc42516[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmaster[m[33m)[m
Author: ernestmwangombe <ernest.mwangombe@10x.ai>
Date:   Thu Jul 23 02:59:53 2026 +0300

    stage2: read endpoints with 404

[1mdiff --git a/Action Recap/Stage 1 Concepts Recap With Action Outcome.pdf b/Action Recap/Stage 1 Concepts Recap With Action Outcome.pdf[m
[1mnew file mode 100644[m
[1mindex 0000000..01b7131[m
[1m--- /dev/null[m
[1m+++ b/Action Recap/Stage 1 Concepts Recap With Action Outcome.pdf[m	
[36m@@ -0,0 +1,112 @@[m
[32m+[m[32mStage 1 Step-by-Step Practical &[m
[32m+[m
[32m+[m[32mConceptual Recap With Steps Taken[m
[32m+[m
[32m+[m[32m1. Dependency Cleanup & Git Tracking (.gitignore & git[m
[32m+[m[32mrm)[m
[32m+[m
[32m+[m[32m ●​ What We Did: Created a .gitignore file containing node_modules/ and ran:​[m
[32m+[m[32m      git rm -r --cached node_modules​[m
[32m+[m
[32m+[m[32m ●​ Why We Did It: In Stage 0, node_modules/ was staged into Git tracking. Running git rm -r[m
[32m+[m[32m      --cached stripped thousands of third-party dependency files from Git's index while[m
[32m+[m[32m      leaving the actual folder intact on disk.[m
[32m+[m
[32m+[m[32m ●​ Sysadmin Analogy: Committing node_modules/ into Git is like backing up volatile cache[m
[32m+[m[32m      or temp directories (/tmp/ or /var/cache/) inside a system configuration snapshot.[m
[32m+[m[32m      Excluding dependencies keeps your repository lightweight, fast, and compliant with clean[m
[32m+[m[32m      version control standards.[m
[32m+[m
[32m+[m[32m2. Express Routing Rules (app.get)[m
[32m+[m
[32m+[m[32m ●​ What We Built: Added two GET routes to server.js:​[m
[32m+[m[32m      app.get('/', (req, res) => { ... });​[m
[32m+[m[32m      app.get('/health', (req, res) => { ... });​[m
[32m+[m
[32m+[m[32m ●​ Sysadmin Analogy: Express routing acts like an Nginx Reverse Proxy or Firewall Access[m
[32m+[m[32m      Control List (ACL). When an inbound TCP packet hits port 3000, the routing engine[m
[32m+[m[32m      evaluates two header criteria:[m
[32m+[m[32m       1.​ HTTP Verb / Method: GET (Data Retrieval)[m
[32m+[m[32m       2.​ URI Path: / or /health[m
[32m+[m
[32m+[m[32mIf a match is found, traffic routes to the designated request handler function. If no match exists,[m
[32m+[m[32mExpress drops through to its default rule and returns an HTTP 404 Not Found response.[m
[32m+[m
[32m+[m[32m3. Shell Commands vs. Interpreter Syntax[m
[32m+[m[32m(Troubleshooting Step)[m
[32m+[m
[32m+[m[32m ●​ What Happened: The terminal command git rm -r --cached node_modules was[m
[32m+[m[32m      accidentally pasted onto line 11 inside server.js.[m
[32m+[m
[32m+[m[32m ●​ The Fix: Removed the shell command from the JS script and executed it inside the[m
[32m+[m[32m      PowerShell terminal prompt instead.[m
[32m+[m
[32m+[m[32m ●​ Sysadmin Analogy: This is identical to pasting a Bash CLI command into an Nginx or[m
[32m+[m[32m      Apache configuration file (nginx.conf). The service daemon fails to parse the file because[m
[32m+[m[32m      shell syntax is invalid inside an application script.[m
[32m+[m
[32m+[m[32m4. Memory Buffering vs Disk State (Ctrl + S & Daemon[m
[32m+[m[32mRestarts)[m
[32m+[m
[32m+[m[32m ●​ What Happened: After editing server.js, running curl in the second terminal tab kept[m
[32m+[m[32m      returning old Stage 0 data (Hello World!) and 404 Not Found for /health.[m
[32m+[m
[32m+[m[32m ●​ Why It Happened:[m
[32m+[m[32m       1.​ The code modifications were buffered in VS Code volatile RAM (indicated by the white[m
[32m+[m[32m            dot next to server.js).[m
[32m+[m[32m       2.​ The active Node process was still running the old bytecode loaded into RAM during[m
[32m+[m[32m            startup.[m
[32m+[m
[32m+[m[32m ●​ The Fix:[m
[32m+[m[32m       1.​ Saved server.js (Ctrl + S) to write changes from RAM buffer to disk.[m
[32m+[m[32m       2.​ Stopped the background daemon with Ctrl + C in the left terminal tab.[m
[32m+[m[32m       3.​ Re-executed node server.js to force the runtime to read the fresh script from disk.[m
[32m+[m
[32m+[m[32m ●​ Sysadmin Analogy: Editing a script without saving is like editing a file in vim without[m
[32m+[m[32m      writing (:w). Restarting the daemon (Ctrl + C + node server.js) is equivalent to running[m
[32m+[m[32m      systemctl restart myapp to reload new binary instructions into active system memory.[m
[32m+[m
[32m+[m[32m5. Structured JSON Serialization (res.json vs res.send)[m
[32m+[m
[32m+[m[32m ●​ What We Built: Replaced plain text output with structured JSON payloads:​[m
[32m+[m[32m      res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });​[m
[32m+[m
[32m+[m[32m ●​ Sysadmin Analogy: Plain text (res.send) sends unstructured strings (Content-Type:[m
[32m+[m[32m      text/html). res.json() automatically sets the MIME header to Content-Type: application/json;[m
[32m+[m[32m      charset=utf-8.[m
[32m+[m
[32m+[m[32m ●​ Why It Matters: Automated B2B integrations (such as invoice extraction pipelines for local[m
[32m+[m[32m      Kenyan businesses) cannot parse raw text reliably. Structured JSON responses allow[m
[32m+[m[32m      downstream database adapters and API clients to parse payloads into typed data fields[m
[32m+[m[32m      safely.[m
[32m+[m
[32m+[m[32m6. Verification & Protocol Inspection (curl -i)[m
[32m+[m
[32m+[m[32m ●​ What We Executed: Ran protocol inspection tests in the second terminal tab:​[m
[32m+[m[32m      curl -i http://localhost:3000/​[m
[32m+[m[32m      curl -i http://localhost:3000/health​[m
[32m+[m
[32m+[m[32m ●​ Output Verified:[m
[32m+[m[32m       ○​ GET /: Returned HTTP/1.1 200 OK, Content-Type: application/json, and body[m
[32m+[m[32m           {"name":"Task API","version":"1.0","endpoints":["/tasks"]}.[m
[32m+[m[32m       ○​ GET /health: Returned HTTP/1.1 200 OK and body {"status":"ok"}.[m
[32m+[m
[32m+[m[32m ●​ Sysadmin Analogy: GET / acts as an SNMP Discovery Query or SSH System Banner,[m
[32m+[m[32m      broadcasting API metadata. GET /health acts as a System Heartbeat / ICMP Ping Probe[m
[32m+[m[32m      used by load balancers (like HAProxy or Nginx) to confirm service health.[m
[32m+[m
[32m+[m[32m7. Stage 1 Commit & Audit History[m
[32m+[m
[32m+[m[32m ●​ What We Executed: Staged, committed, and audited Stage 1 in Git:​[m
[32m+[m[32m      git add .​[m
[32m+[m[32m      git commit -m "Stage 1: root and health endpoints"​[m
[32m+[m[32m      git log --oneline​[m
[32m+[m
[32m+[m[32m ●​ Verified Log Output:​[m
[32m+[m[32m      15fe97e (HEAD -> master) Stage 1: root and health endpoints​[m
[32m+[m[32m      f4a5e22 Stage 0: hello server​[m
[32m+[m
[32m+[m[32m ●​ Sysadmin Analogy: git add . stages changed configuration files into the staging area (like[m
[32m+[m[32m      staging updates in a staging environment). git commit creates an immutable restore point[m
[32m+[m[32m      (system snapshot), and git log reviews the system audit trail.[m
[32m+[m[32m[m
[1mdiff --git a/Action Recap/Stage 1 Concepts Recap.pdf b/Action Recap/Stage 1 Concepts Recap.pdf[m
[1mnew file mode 100644[m
[1mindex 0000000..aafdc25[m
[1m--- /dev/null[m
[1m+++ b/Action Recap/Stage 1 Concepts Recap.pdf[m	
[36m@@ -0,0 +1,80 @@[m
[32m+[m[32mStage 1 Step-by-Step Practical &[m
[32m+[m
[32m+[m[32mConceptual Recap[m
[32m+[m
[32m+[m[32m1. Express Routing Rules (app.get)[m
[32m+[m
[32m+[m[32m ●​ What We Built:​[m
[32m+[m[32m      app.get('/', (req, res) => { ... });​[m
[32m+[m[32m      app.get('/health', (req, res) => { ... });​[m
[32m+[m
[32m+[m[32m ●​ Sysadmin / Network Analogy: Express routing functions like an Nginx Reverse Proxy or[m
[32m+[m[32m      Firewall Access Control List (ACL). When an inbound TCP packet hits port 3000, the[m
[32m+[m[32m      routing engine evaluates the request header against two criteria:[m
[32m+[m[32m       1.​ HTTP Method / Verb: GET (Retrieval)[m
[32m+[m[32m       2.​ URI Path: / or /health[m
[32m+[m
[32m+[m[32mIf a match is found, traffic is routed to the designated request-handler function. If no match[m
[32m+[m[32mexists, Express automatically drops through to its default rule and returns an HTTP 404 Not[m
[32m+[m[32mFound response.[m
[32m+[m
[32m+[m[32m2. Structured JSON Payload Serialization (res.json vs[m
[32m+[m[32mres.send)[m
[32m+[m
[32m+[m[32m ●​ What We Built: Replacing plain text output with structured JSON responses:​[m
[32m+[m[32m      res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });​[m
[32m+[m
[32m+[m[32m ●​ Sysadmin / Network Analogy: In Stage 0, res.send() transmitted unstructured text[m
[32m+[m[32m      (Content-Type: text/html). In Stage 1, res.json() automatically sets the MIME header to[m
[32m+[m[32m      Content-Type: application/json; charset=utf-8.[m
[32m+[m
[32m+[m[32m ●​ Why it matters: In automated B2B integrations (like invoice extraction pipelines for Kenyan[m
[32m+[m[32m      SMEs), client systems cannot easily parse arbitrary text strings. Delivering predictable[m
[32m+[m[32m      JSON structures allows downstream automation scripts and database adapters to safely[m
[32m+[m[32m      parse payloads into typed data fields.[m
[32m+[m
[32m+[m[32m3. Service Discovery & Banners (GET /)[m
[32m+[m
[32m+[m[32m ●​ What We Built: A root endpoint returning API metadata and available endpoints.[m
[32m+[m[32m ●​ Sysadmin / Network Analogy: This acts like an SNMP Discovery Query or an SSH/FTP[m
[32m+[m
[32m+[m[32m      System Identification Banner. When an external client or orchestration service hits your[m
[32m+[m[32m      root URL, it receives an automated system manifesto detailing what the server is (Task API)[m
[32m+[m[32m      and where its operational resources reside (/tasks).[m
[32m+[m
[32m+[m[32m4. Operational Health Checks & Liveness Probes (GET[m
[32m+[m[32m/health)[m
[32m+[m
[32m+[m[32m ●​ What We Built: A lightweight endpoint returning {"status": "ok"} with HTTP 200.[m
[32m+[m[32m ●​ Sysadmin / Network Analogy: This functions as an enterprise System Heartbeat Probe[m
[32m+[m
[32m+[m[32m      or ICMP Keep-Alive. Production load balancers (e.g., Nginx, HAProxy, AWS ALB) and[m
[32m+[m[32m      monitoring daemons (Nagios, Zabbix, Docker) periodically ping /health.[m
[32m+[m[32m ●​ Operational Impact: If your application process deadlocks or crashes, the monitor[m
[32m+[m[32m      detects failed /health checks (e.g., timeouts or 500 errors) and automatically reroutes[m
[32m+[m[32m      traffic or restarts the daemon process.[m
[32m+[m
[32m+[m[32m5. Memory Buffering vs Disk State (Ctrl + S & Daemon[m
[32m+[m[32mRestarts)[m
[32m+[m
[32m+[m[32m ●​ What Happened: When you modified server.js, curl initially kept returning old Stage 0 data[m
[32m+[m[32m      until you saved the file and restarted Node.[m
[32m+[m
[32m+[m[32m ●​ Sysadmin / Network Analogy:[m
[32m+[m[32m       ○​ Unsaved edits in VS Code live in volatile RAM buffers (marked by the white dot/M[m
[32m+[m[32m           status).[m
[32m+[m[32m       ○​ Node loads the binary script into execution memory only upon startup. Running[m
[32m+[m[32m           changes require flushing the active daemon (Ctrl + C) and re-executing node server.js[m
[32m+[m[32m           to force the runtime to read the updated bytecode from disk.[m
[32m+[m
[32m+[m[32m6. Repository Hygiene & Version Control Filtering[m
[32m+[m[32m(.gitignore)[m
[32m+[m
[32m+[m[32m ●​ What We Built: Creating .gitignore containing node_modules/ and running git rm -r[m
[32m+[m[32m      --cached node_modules.[m
[32m+[m
[32m+[m[32m ●​ Sysadmin / Network Analogy: Committing node_modules/ into Git is equivalent to[m
[32m+[m[32m      backing up temp files (/tmp/) or compiled binary libraries inside a system configuration[m
[32m+[m[32m      snapshot repository. Excluding dependencies keeps your codebase lightweight, secure,[m
[32m+[m[32m      and compliant with clean repository management standards.[m
[32m+[m[32m[m
[1mdiff --git a/ReadMe Notes/Stage 1 README.docx b/ReadMe Notes/Stage 1 README.docx[m
[1mnew file mode 100644[m
[1mindex 0000000..e7aa77b[m
