<template>
  <section>
    <h2>{{ share.email }}</h2>
    <form>
      <table>
        <tr>
          <td>First Name</td>
          <td><input type="text" v-model="reg.fname" autofocus @change="fnameChg"></td>
        </tr>
        <tr>
          <td>Last Name</td>
          <td><input type="text" v-model="reg.lname" @change="lnameChg"></td>
        </tr>
        <tr>
          <td>Phone</td>
          <td><input type="tel" v-model="phone" @keypress="phonInp" @input="phonChg" pattern="^\d{3}[\-]\d{3}[\-]\d{4}?"></td>
          <td>Needed for verified user</td>
        </tr>
        <tr>
          <td>Password</td>
          <td><input @blur="passDiff" type="password" required v-model="pass0" @keypress="chkPass" @input="pChg"></td>
          <td rowspan="2" style="float: left;"> Strength {{ strength }}</td>
        </tr>
        <tr>
          <td>Password again</td>
          <td><input @blur="passDiff" type="password" required v-model="pass1" @keypress="chkPass" @change="pChg"></td>
        </tr>
        <tr>
          <td colspan="3" class="opt">Optional</td>
        </tr>
      </table>
      <reg-options ref="options"></reg-options>
      <div class="btnclass">
        <button
          class="btns"
          @click="regNow">Register</button>
        <button
          class="btns"
          @click="regReset">Reset</button>
      </div>
    </form>
    <div style="display: block;">
      <div class="usertype">
        <span class="uhead">Anonymous User</span><br>
        <ul class="slist">
          <li>Create a budget</li>
          <li>Output a budget, hard copy only</li>
          <li>Load a template</li>
        </ul>
      </div>

      <div class="usertype">
        <span class="uhead">Registered User</span> Anonymous User plus<br>
        <ul class="slist">
          <li>Output a budget, digitally and hard copy</li>
          <li>Save a budget</li>
          <li>Load a budget</li>
          <li>Change profile</li>
          <li>Submit budget in unofficial result</li>
        </ul>
      </div>

      <div class="usertype">
        <span class="uhead">Verified User</span> Registered user plus<br>
        <ul class="slist">
          <li>Submit budget for official results</li>
          <li>Save a Template for other people to use</li>
        </ul>
      </div>
    </div>
  </section>
</template>
<script>
import nacl from 'tweetnacl'
import base64 from 'base64-js'
import RegOptions from './RegOptions'
import Rpc from './Rpc'

export default {
  name: 'Register',
  mixins: [
    Rpc
  ],
  components: {
    'reg-options': RegOptions
  },
  props: {
    share: {}
  },
  data () {
    return {
      reg: {
        fname: '',
        lname: '',
        phon: '',
        age: -1,
        wealth: -1,
        social: -1,
        fiscal: -1
      },
      phone: '',
      strength: 0,
      pass0: '',
      pass1: '',
      noMatch: false,
      tooWeak: false
    }
  },
  methods: {
    regNow () {
      let reg = this.reg
      // check values again
      if (reg.fname.length < 2) {

      }
      if (reg.lname.length < 2) {

      }
      if (reg.pass0 !== reg.pass1) {
      }
      // let salt = this.share.salt
      let nonce = nacl.randomBytes(nacl.box.nonceLength)
      let buf = new Uint8Array(this.pass0.length + 24)
      buf.set(Uint8Array.from(this.pass0))
      buf.set(nonce, this.pass0.length)
      let hash = nacl.hash(buf)

      // overkill
      // let seal = nacl.after(hash, nonce, this.share.fast)
      // to check keys
      // let safe - nacl.after(nonce, seal.slice(0,24), this.share.fast)

      reg.pass = base64.fromByteArray(hash)
      reg.salt = base64.fromByteArray(nonce)
      let args = reg
      console.log(this.url)
      this.sendRpc('regdata', args, (rslt, error) => {
        if (rslt) { // rslt is just json data
          console.log('REGDATA', rslt)
          if (rslt.sess) {
            this.$router.replace('/')
            this.id = rslt.id
            this.nonce = rslt.nonce
            this.create = false
            this.login = true
          } else {
            this.error = this.nonce
            this.tryAgain()
          }
        } else { // the rslt is the response
          console.log('REGDATA', rslt)
        }
      })
    },
    passDiff () {

    },
    passAgain () {

    },
    regReset () {

    },
    fnameChg (evt) {
      let val = evt.target.value
      if (val.length < 2) {
        alert('At least two leters')
      }
    },
    lnameChg (evt) {
      let val = evt.target.value
      if (val.length < 2) {
        alert('At least two leters')
      }
    },
    phonInp (evt) {
      let code = evt.keyCode
      console.log(code)
      if (code < 48 || code > 57) {
        evt.preventDefault()
      }
    },
    phonChg (evt) {
      let phone = this.phone.replace(/\D/g, '')
      let len = phone.length
      let tmp = ''
      /* eslint no-fallthrough: "warn" */
      switch (len) {
        default:
          tmp = '-' + phone.slice(6, 10)
        // eslint-disable-next-line
        case 4:
        case 5:
        case 6:
          tmp = '-' + phone.slice(3, 6) + tmp
        // eslint-disable-next-line
        case 0:
        case 1:
        case 2:
        case 3:
          tmp = phone.slice(0, 3) + tmp
      }
      this.phone = tmp
    },
    pChg (evt) {
      let p0 = this.pass0
      let p1 = this.pass1
      if (p0 !== p1) {
        this.noMatch = true
      }
      if (this.strength < 60) {
        this.tooWeak = true
      }
    },
    chkPass (evt) {
      this.noMatch = false
      let pass = evt.target.value
      let val = this.passStrength(pass)
      this.strength = val
    },
    passStrength (pass) {
      let score = 0
      if (!pass) {
        return score
      }

      // award every unique letter until 5 repetitions
      let letters = {}
      for (var i = 0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1
        score += 5.0 / letters[pass[i]]
      }

      // bonus points for mixing it up
      let variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        special: /[!@#$%^&*]/.test(pass),
        nonWords: /\W/.test(pass)
      }

      let variationCount = 0
      for (var check in variations) {
        variationCount += (variations[check] === true) ? 1 : 0
      }
      score += (variationCount - 1) * 10

      return parseInt(score)
    }
  },
  computed: {
    age: function () {
      this.reg.age = this.$refs.options.age
      return this.reg.age
    },
    wealth: function () {
      this.reg.wealth = this.$refs.options.wealth
      return this.reg.wealth
    },
    social: function () {
      this.reg.social = this.$refs.options.social
      return this.reg.social
    },
    fiscal: function () {
      this.reg.fiscal = this.$refs.options.fiscal
      return this.reg.fiscal
    }
  }
}
</script>
<style scoped>

.slide {
  display: inline-block;
  width: 100%;
}

.opt {}

.smid {
  display: inline-block;
  font-size: .7em;
  width: 18%;
  position: relative;
  top: -10px;
}

.smin {
  text-align: left;
  display: inline-block;
  float: left;
  font-size: .7em;
  position: relative;
  top: -5px;
}

.smax {
  display: inline-block;
  float: right;
  font-size: .7em;
  position: relative;
  top: -5px;
  right: 0px;
  text-align: right;
}

.sclass {
  display: inline-block;
  position: relative;
  margin-top: 0px;
  width: 95%;
}

.btns {
  width: 20%;
  margin: 5%;
}

.btndiv {
  width: 100%;
}

.slist {
  margin-top: 0px;
  margin-left: 1em;
  float: left;
  text-align: left;
}
.usertype {
  display: block;
  float: left;
  width: 100%;
  text-align: left;
}
.uhead {
  font-weight: bold;
  text-align: left;
  float: left;
  margin-right: 2em;
}
</style>
