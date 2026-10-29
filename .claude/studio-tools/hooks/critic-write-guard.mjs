#!/usr/bin/env node
// PreToolUse hook for the Critic subagent: it may only write QA reports and
// evidence under a project's studio/qa/ folder, never site code or specs.
// Reads the hook payload from stdin; exit 2 blocks the call and the stderr
// message is shown to the Critic.
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let filePath = "";
  try {
    const payload = JSON.parse(input || "{}");
    filePath = payload.tool_input?.file_path || payload.tool_input?.path || "";
  } catch {
    process.exit(0); // Malformed payload: don't block on our own parsing problem.
  }
  const normalized = filePath.replace(/\\/g, "/");
  if (/\/studio\/qa\//.test(normalized) || /^studio\/qa\//.test(normalized)) process.exit(0);
  console.error(
    `Critic may only write inside <project>/studio/qa/. Blocked write to: ${filePath || "(no path)"}. ` +
      "Report the problem as a defect for its owner instead of changing the file."
  );
  process.exit(2);
});
