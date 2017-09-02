import axios from 'axios'
import nacl from 'tweetnacl'
import base64 from 'base64-js'

export function sendRpc (cmd, args, cb) {
  let params = args
  let id = base64.fromByteArray(nacl.randomBytes(8))
  axios.post(this.url, {
//        jsonrpc: '2.0',
    cmd: cmd,
    id: id,
    sess: base64.fromByteArray(this.key.publicKey),
    params: params
  }, {
    headers: {
      'Content-Type': 'application/json'
    },
    responseType: 'json'
  })
    .then(response => {
      let rslt = response.data.result
      // check rslt.id
      console.log(response.data.id, id)
      cb(rslt, true)
    })
    .catch(e => {
      cb(e, false)
    })
}
