const {Pool} = require('pg');

const pool = new Pool({
    connectionString: 'postgres://mojadb_user:x0o50gnoIwAJ2QACxli3GCSEbfYXHbGH@dpg-cdfpd5kgqg4d3gib5io0-a.frankfurt-postgres.render.com/mojadb',
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => {
        const start = Date.now();
        return pool.query(text, params)
            .then(res => {
                const duration = Date.now() - start;
                //console.log('executed query', {text, params, duration, rows: res.rows});
                return res;
            });
    },
    pool: pool
}
