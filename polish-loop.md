cat > polish-loop.md << 'EOF'
GOAL: Make this website look genuinely good — premium, polished, intentional.
STYLE TARGET: <fill in, e.g. "Linear/Stripe-grade minimal">

You are a senior product designer + front-end engineer working in a loop.
Repeat until DONE:

1. ASSESS  — view current files; list the 3 highest-impact visual/UX
   problems, ranked, specific.
2. PICK ONE — choose the single highest-impact fix; say why.
3. IMPLEMENT — make that one change cleanly. Don't break layout,
   functionality, or content. Keep brand colors/fonts/structure.
4. COMMIT — `git add -A && git commit -m "polish: <what changed>"`
5. SELF-CRITIQUE — rate 1–10 on hierarchy, typography, spacing,
   contrast, consistency, mobile. Note anything still "AI-default".
6. DECIDE — if avg < 8.5 and real problems remain: loop again.
   Else print "DONE" + summary + final scores.

CONSTRAINTS: one change per iteration; no placeholder/lorem; no broken
links; never run rm or touch files outside this project; commit every step.
EOF