# Task
Implement a web application with a dynamic table, CRUD operations and authorization

# Tech stack
A hybrid SPA and SSR application built with SvelteKit and node.js

# How to set up
1. Add .env file with database keys to root

```
MYSQL_UNAME=""
MYSQL_PW=""
MYSQL_DB=""
```

2.
```
npm run dev
```

# Structure

- `static/` - static assets that are not prerendered
- `src/` - application root
- `src/lib/` - application components
- `src/routes/` - server page routes
- `src/routes/api` - server api endpoints and helpers
