const app = require("express")();

// Initialise the Prometheus client.
const client = require("prom-client");

function calculator(first_number, operator , second_number){
    switch (operator){
        case "+":
            console.log(first_number + " + " + second_number + " = " + Number(first_number + second_number));
            break;
        case "-":
            console.log(first_number + " - " + second_number + " = " + Number(first_number - second_number));
            break;
        case "*":
            console.log(first_number + " * " + second_number + " = " + Number(first_number * second_number));
            break;
        case "/":
            console.log(first_number + " / " + second_number + " = " + Number(first_number / second_number));
            break;
        default:
            console.log("Please specify + - * or / as the operator values.");
    }
}

// const register = client.register;
// const collectDefaultMetrics = client.collectDefaultMetrics;
// collectDefaultMetrics({ register });

// https://stackabuse.com/nodejs-application-monitoring-with-prometheus-and-grafana/
// Create a Registry to register the metrics.
const register = new client.Registry();

// This statement for default metrics.
// client.collectDefaultMetrics({register});

// This statement for custom metrics.
client.collectDefaultMetrics({
    app: 'node-application-monitoring-app',
    prefix: 'node_',
    timeout: 10000,
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
    register
});

// Create a custom histogram metric.
const httpRequestTimer = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
  });
  
  // Register the histogram
  register.registerMetric(httpRequestTimer);

// This is a very simple Node Express app with a single endpoint: /hello. 
app.get('/hello', (req, res) => {
 const { name = 'World' } = req.query;
 res.json({ message: `Hello, ${name}!` });
});

app.get('/calculator', (req, res) => {
    const { name = 'World' } = req.query;
    res.json({ message: calculator(5, "+", 2) });
   });

// Add an endpoint to expose the above metrics.
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
   });

app.listen(port=3000, () => {
 console.log('Example api is listening on http://localhost:3000, metrics are exposed on http://localhost:3000/metrics');
});
