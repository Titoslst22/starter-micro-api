(async () => {
  const MailosaurClient = require('mailosaur');
  const https = require('https');
  const { JSDOM } = require('jsdom');
  const axios = require('axios');	

  const mailosaur = new MailosaurClient('1d0EBsAAzGyomWgr');
  const serverDomain = 'q2sfbmo0.mailosaur.net';
  const webhookURL = 'https://discord.com/api/webhooks/1012508280968454234/kQTHiQtFhmWxeG_E7R5rMUrx1oktNh3gvedFCNH8Gzy15DajHsk-KPGGwyvE_vvp8G3n';

  const words = serverDomain.split('.');
  const serverId = words[0];
  

  const searchCriteria = {
    sentTo: '@' + serverDomain,
    subject: "Growtopia New Account Verification"
  };


  const processedWords = [];
axios.post(webhookURL, { content: `Logged in as ${serverDomain}`});
  console.log('Logged in as', serverDomain);

let hasCalledDeleteAllEmails = false;
const deleteAllEmails = async () => {
  if (!hasCalledDeleteAllEmails) {
    hasCalledDeleteAllEmails = true;
    await mailosaur.messages.deleteAll(serverId);
    axios.post(webhookURL, { content: 'All messages has been deleted every 1 hour' });
  }
};

setInterval(() => {
  hasCalledDeleteAllEmails = false;
}, 3600000);

setInterval(deleteAllEmails, 3600000);


  while (true) {
    try {
	const limits = await mailosaur.usage.limits();
	
	
      const message = await mailosaur.messages.get(serverId, searchCriteria, { receivedAfter: new Date(2023, 01, 01) });

      const firstLink = message.html.links[0];

      https.get(firstLink.href, (res) => {
        if (res.statusCode === 302) {
          const dom = new JSDOM(message.html.body);
          const el = dom.window.document.querySelector('title');
          const verificationCode = el.textContent;
          const words = verificationCode.split(' ');
          const lastWord = words[words.length - 1];
          
       
  	    //console.log(lastWord, "| Success");
  		
  	   // only send the message if it hasn't been sent before
          if (!processedWords.includes(lastWord)) {
            processedWords.push(lastWord);
  		
  	      axios.post(webhookURL, { content: `${lastWord} | Success | Today's Usage: ${limits.email.current}/2000`});
          }
	
	 mailosaur.messages.del(message.id);
         
        } else if (res.statusCode === 404) {
          console.log('404');
		axios.post(webhookURL, { content: "AUTO AAP stopped! DM owner" });
        }
      }).on('error', (e) => {
        console.error(e);
      });
    } catch (err) {
      if (err.errorType === 'search_timeout') {
        continue;
      }
      console.error(err);
      axios.post(webhookURL, { content: "AUTO AAP stopped! DM owner" });
      break;
    } 
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
})();
