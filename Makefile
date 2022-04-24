cache:
	deno cache --lock=lock.json --lock-write ./*.ts
run:
	deno run index.ts