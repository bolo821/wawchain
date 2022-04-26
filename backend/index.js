const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

const mongoose = require("mongoose");
const config = require('./config/config');
const db_string = config.MONGO_URL;
const MODE = config.DEPLOY_MODE;

require("./models/Token");
require("./models/User");

mongoose.connect(db_string, { useNewUrlParser: true })
.then(() => {
  	console.log("MongoDB connected...");
})
.catch(err => console.log(err));

app.use(bodyParser.json());
app.use(cors());

const token = require('./routes/tokenRoutes');
const user = require('./routes/userRoutes');
const wallet = require('./routes/walletRoutes');
const rpc = require('./routes/rpcRoutes');
app.use('/api/token', token);
app.use('/api/user', user);
app.use('/api/wallet', wallet);
app.use('/api/rpc', rpc);

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