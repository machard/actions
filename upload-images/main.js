const fetch = require('isomorphic-unfetch');
const core = require('@actions/core');
const fs = require('fs');
const FormData = require('form-data');

const uploadImage = async () => {
  const clientId = core.getInput('clientId', { required: true });
  const path = core.getInput('path');

  if (!clientId) {
    throw new Error('no clientId defined');
  }

  const upload = async (file) => {
    const body = new FormData();
    body.append('type', 'file');
    body.append('image', file);

    const res = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Client-ID ${clientId}`,
      },
      body,
    });

    return res.json();
  };

  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path);
    const resultsP = files.map((file) => {
      const img = fs.readFileSync(`${path}/${file}`);
      return upload(img);
    });

    const results = await Promise.all(resultsP);
    const res = results.map((r) => {
      return r.data.link;
    });
    console.log(res);
    core.setOutput('images', res);
  }
};

uploadImage().catch((err) => {
  core.setFailed(err);
});