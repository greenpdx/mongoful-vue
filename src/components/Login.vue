<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div>
      {{ data }}
    </div>
    <div v-if="login">
      <form>
        <input ref="email" class="email" type="email" v-model="email" placeholder="EMAIL user@domain.com" required title="Please enter email address" pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$">
        <div>
          <button @click="onLogin">Login</button>
          <button @click="onRegister">Register</button>
        </div>
      </form>
    </div>
    <div v-else>
      <div v-if="!create">
        <input type="password" v-model="lpasswd" title="Enter Password" autofocus/>
        <button @click="onPasswd">Password</button>
      </div>
      <div v-else>
        <register :share="share"></register>
      </div>
    </div>
  </div>
</template>

<script>
import nacl from 'tweetnacl'
import base64 from 'base64-js'
import Rpc from './Rpc'
import Register from './Register'
// import sendRpc from '@/lib/rpc'
// try vue-masked-input for phone

// const ^[A-Z0-9._%+-]++@[A-Z0-9.-]++\.[A-Z]{2,}+$
// const regexEmail = '/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/'
// const regexEmail2 = '^(?=[A-Z0-9][A-Z0-9@._%+-]{5,253}+$)[A-Z0-9._%+-]{1,64}+@(?:(?=[A-Z0-9-]{1,63}+\.)[A-Z0-9]++(?:-[A-Z0-9]++)*+\.){1,8}+[A-Z]{2,63}+

const share = {
  key: '',
  nonce: '',
  salt: '',
  pkey: '',
  pnonce: '',
  email: ''
}

function rdSession () {
  let pkey = sessionStorage.getItem('tnv-pkey')
  let skey = sessionStorage.getItem('tnv-skey')
  let ts = sessionStorage.getItem('tnv-ts')

  if (ts && ts + 1000 < Date.now()) {
    skey = null
    console.log('new')
  }

  let key = {publicKey: '', secretKey: ''}
  if (!skey) {
    key = nacl.box.keyPair()
    console.log(key.secretKey.length)
    wrSession({key: key})
  } else {
    console.log(pkey, skey)
    key.publicKey = base64.toByteArray(pkey)
    key.secretKey = base64.toByteArray(skey)
  }
  return key
}
function wrSession (conf) {
  let key = conf.key
  let pkey = base64.fromByteArray(key.publicKey)
  let skey = base64.fromByteArray(key.secretKey)
  sessionStorage.setItem('tnv-pkey', pkey)
  sessionStorage.setItem('tnv-skey', skey)
  sessionStorage.setItem('tnv-ts', Date.now())
}

export default {
  name: 'Login',
  mixins: [
    Rpc
  ],
  components: {
    'register': Register
  },
  data () {
    return {
      login: true,
      msg: 'Welcome to Your Vue.js PWA',
      data: '',
      email: 'ss@ss.cc',
      salt: false,
      lpasswd: '',
      token: null,
      sess: null,
      create: false,
      error: null,
      share: share
    }
  },
  beforeCreate () {
    this.share = share
    let conf = rdSession()
    this.share.key = conf
    this.share.nonce = nacl.randomBytes(nacl.box.nonceLength)
  },
  created () {
    console.log('HELLO>', this.nonce)
    this.sendRpc('hello', {
      hello: base64.fromByteArray(this.share.nonce)
    }, (rslt, error) => {
      if (!error) { // rslt is just json data
        if (rslt.hello.length === 44) {
          this.share.pkey = base64.toByteArray(rslt.hello)
          this.share.fast = nacl.box.before(this.share.pkey, this.share.key.secretKey)
          console.log('HELLO<', rslt, this.share.pkey, this.share.fast)
        } else {
          alert('Stop Hacking')
          window.location.assign('/hacking?trys=many')
        }
      } else { // the rslt is the response
        console.log('HELLO!', rslt)
      }
    })
  },
  methods: {

    onLogin (evt) {
      let tgt = this.$refs.email
      if (!tgt.validity.valid) {
        this.tryAgain()
        return
      }
      this.share.email = tgt.email
      let args = {
        email: tgt.value
      }
      this.sendRpc('login', args, (rslt, error) => {
        if (!error) { // rslt is just json data
          console.log('LOGIN', rslt)
          if (rslt.salt) {
            this.share.salt = base64.toByteArray(rslt.salt)
            this.share.nonce = base64.toByteArray(rslt.nonce)
            this.login = false
          } else {
            this.error = this.nonce
            this.tryAgain()
          }
        } else { // the rslt is the response
          console.log('LOGIN', rslt)
        }
      })
    },
    tryAgain () {

    },
    onPasswd () {
      let enc = new TextEncoder()
      let hash = nacl.hash(enc.encode(this.share.salt + this.lpasswd))
      let no = enc.encode(this.share.nonce + hash.buffer.toString('base64'))
      let xfer = nacl.hash(no)
      let buf = Buffer.from(xfer.buffer).toString('base64')
      this.lpasswd = ''
      console.log(buf, hash)
      this.sendRpc('pass', {
        pass: buf,      // base64(box(hash(array(password) + salt)), nonce, fast))
        nonce: ''        // base64(box(nonce, pass, fast))
      }, (rslt, error) => {
        if (!error) { // rslt is just json data
          console.log('PASS', rslt)
          if (rslt.salt) {
            this.sess = rslt.salt
            this.token = rslt.nonce
            this.login = false
          } else {
            this.error = rslt.nonce
            this.passAgain()
          }
        } else { // the rslt is the response
          console.log('PASS', rslt)
        }
      })
    },
    onRegister (evt) {
      let tgt = this.$refs.email
      if (!tgt.validity.valid) {
        this.tryAgain()
        return
      }
      this.share.email = tgt.value
      let args = {
        email: tgt.value
      }
      this.sendRpc('create', args, (rslt, error) => {
        if (!error) { // rslt is just json data
          console.log('CREATE', rslt)
          if (rslt.salt) {
            this.login = false
            this.create = true
            this.share.salt = base64.toByteArray(rslt.salt)
            this.share.pnonce = base64.toByteArray(rslt.nonce)
          } else {
            this.error = rslt.nonce
            this.tryAgain()
          }
        } else { // the rslt is the response
          console.log('CREATE', rslt)
        }
      })
    }
  },
  watch: {
    email: function (email) {

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.email:invalid {
  background-color: #fdd;
}

.email:valid {
  background-color: #dfd;
}

</style>
