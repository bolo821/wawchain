const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

const app = express();

// const mongoose = require("mongoose");
// const db_string = process.env.MONGO_URL;
const MODE = process.env.DEPLOY_MODE;

// mongoose.connect(db_string, { useNewUrlParser: true })
// .then(() => {
//   	console.log("MongoDB connected...");
// })
// .catch(err => console.log(err));

app.use(bodyParser.json());
app.use(cors());

const rpc = require('./routes/rpcRoutes');
const search = require('./routes/searchRoutes');
app.use('/api/rpc', rpc);
app.use('/api/search', search);

let PORT;
if (MODE === 'production') {
	PORT = 8443;
	const httpsServer = https.createServer({
		key: fs.readFileSync('./wawchain.com.key'),
		cert: fs.readFileSync('./wawchain_com_139798397wawchain_com.crt'),
		ca: [
			fs.readFileSync('./wawchain_com_139798397TrustedRoot.crt'),
			fs.readFileSync('./wawchain_com_139798397DigiCertCA.crt'),
		]
	}, app);

	options = {
		cors: true,
		origins: "*",
	}
	require('./socketServer')(httpsServer, options);

	httpsServer.listen(PORT, () => {
		console.log(`HTTPS Server running on port ${PORT}`);
	});
} else if (MODE === 'development') {
	PORT = 5000;
	const server = http.createServer(app);
	options = {
		cors: true,
		origins: "*",
	}
	require('./socketServer')(server, options);

	server.listen(PORT, () => {
		console.log(`Server is listening at port ${PORT}`);
	})
}