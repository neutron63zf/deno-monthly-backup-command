cache:
	deno cache --lock=lock.json --lock-write ./*.ts
run:
	deno run index.ts
install:
	deno install -A --unstable --force --reload --name monthly-backup cli.ts