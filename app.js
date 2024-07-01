App = {
  loading: false,
  contracts: {},

  load: async () => {
      await App.loadWeb3()
      await App.loadAccount()
      await App.loadContract()
      await App.render()
  },

  loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
          App.web3Provider = web3.currentProvider
          web3 = new Web3(web3.currentProvider)
      } else {
          window.alert("Please connect to Metamask.")
      }
      if (window.ethereum) {
          window.web3 = new Web3(ethereum)
          try {
              await ethereum.enable()
          } catch (error) {
              console.error("User denied account access")
          }
      } else if (window.web3) {
          App.web3Provider = web3.currentProvider
          window.web3 = new Web3(web3.currentProvider)
      } else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
  },

  loadAccount: async () => {
      App.account = (await web3.eth.getAccounts())[0]
  },

  loadContract: async () => {
      const donation = await $.getJSON('Donation.json')
      App.contracts.Donation = TruffleContract(donation)
      App.contracts.Donation.setProvider(App.web3Provider)
      App.donation = await App.contracts.Donation.deployed()
  },

  render: async () => {
      if (App.loading) {
          return
      }
      App.setLoading(true)
      $('#account').html(App.account)
      await App.renderDonations()
      App.setLoading(false)
  },

  renderDonations: async () => {
    const donationCount = await App.donation.donationCount()
    const $donationTemplate = $('#donationTemplate').html()

    $('#donationList').html('') // Clear the existing donations

    for (var i = 1; i <= donationCount; i++) {
      const donation = await App.donation.donations(i)
      const donationId = donation.id.toNumber()
      const donationAmount = web3.utils.fromWei(donation.montant, 'ether')
      const donationTimestamp = new Date(donation.timestamp.toNumber() * 1000).toLocaleString()

      const $newDonationTemplate = $donationTemplate.replace('{{id}}', donationId)
        .replace('{{amount}}', donationAmount)
        .replace('{{timestamp}}', donationTimestamp)

      $('#donationList').append($newDonationTemplate)
    }
  },

  createDonation: async () => {
      App.setLoading(true)
      const donationAmount = $('#donationAmount').val()
      await App.donation.createDonation({ from: App.account, value: web3.utils.toWei(donationAmount, 'ether') })
      window.location.reload()
  },

  setLoading: (boolean) => {
      App.loading = boolean
      const loader = $('#loader')
      const content = $('#content')
      if (boolean) {
          loader.show()
          content.hide()
      } else {
          loader.hide()
          content.show()
      }
  }
}

$(() => {
  $(window).load(() => {
      App.load()
  })
})
