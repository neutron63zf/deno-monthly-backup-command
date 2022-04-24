cache:
	deno cache --lock=lock.json --lock-write ./*/**.ts
run:
	deno run --allow-read=./.env index.ts