# database Internals

- Every real database stores in **fixed-size pages**. SQLite uses 4KB. Postgres uses 8KB. 

- A page is just ***Buffer***

```bash
  node server.ts // terminal 1
  node opt/terminal.ts // terminal 2 
```
