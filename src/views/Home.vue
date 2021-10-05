<template>

<div>

   <div class="section  bg-white border-b-2 border-black px-0 lg:px-1">

     <div class=" ">
        <Navbar 
        v-bind:web3Plug="web3Plug"
       />
     </div>


   </div>

  

   <div class="section  bg-white border-b-2 border-black">
     <div class=" w-container">
       
       <div class="w-row">

         

         <div class="  w-col   mt-8  flex ">
           <div class="flex-grow"> </div> 
           <router-link  to="/burn" class="mx-1 my-2 mb-8 bg-red-500 px-1 border-2 border-black text-white rounded inline-block cursor-pointer select-none no-underline"> I want to burn </router-link>
          <router-link  to="/claimtoast" class="mx-1 my-2 mb-8 bg-teal-300 px-1 border-2 border-black text-black rounded inline-block cursor-pointer select-none no-underline"> Claim Toast </router-link>
 
        </div>


      



         <div class="  w-col   mb-8 ">

           <div> Top Burners </div>

            <div class="my-2 mb-8 bg-orange-500 px-1 border-2 border-black text-white rounded inline-block"> 0xBTC </div>

          <GenericTable 
          v-bind:labelsArray="['from', 'amount']"
          v-bind:rowsArray="burnRowsArray"
          v-bind:clickedRowCallback="onBurnRowClicked"
          />



         </div>
         
       </div>
     </div>
   </div>


    <div class="section  bg-white border-b-2 border-black ">
     <div class="w-container pt-8">

          
        
         


     </div>
   </div>



    
  <Footer/>

</div>
</template>


<script>



import Web3Plug from '../js/web3-plug.js' 

 
import Navbar from './components/Navbar.vue';
 
import Footer from './components/Footer.vue';
import TabsBar from './components/TabsBar.vue';

import GenericTable from './components/GenericTable.vue'
  
import StarflaskAPIHelper from '../js/starflask-api-helper.js';

import MathHelper from '../js/math-helper.js'

export default {
  name: 'Home',
  props: [],
  components: {Navbar, Footer, TabsBar, GenericTable  },
  data() {
    return {
      web3Plug: new Web3Plug() ,
      
     // selectedTab:"burns",
      burnRowsArray:[],

      accountHasToast: {}
      

      
    }
  },

  created(){

 
    this.web3Plug.getPlugEventEmitter().on('stateChanged', function(connectionState) {
        console.log('stateChanged',connectionState);
         
        this.activeAccountAddress = connectionState.activeAccountAddress
        this.activeNetworkId = connectionState.activeNetworkId

        
          

         
      }.bind(this));
   this.web3Plug.getPlugEventEmitter().on('error', function(errormessage) {
        console.error('error',errormessage);
         
        this.web3error = errormessage
       
      }.bind(this));

      this.web3Plug.reconnectWeb()

         
      this.fetchBurnedAssets(  )
       

  },
  mounted: function () {
    
   
   
  }, 
  methods: {
          /*setActivePanel(panelId){
              if(panelId == this.activePanelId){
                this.activePanelId = null;
                return 
              }
               this.activePanelId = panelId ;
          },
          onTabSelect(tabname){
            console.log(tabname)

              this.selectedTab = tabname.toLowerCase()


          },*/

          async fetchBurnedAssets(){


            await this.fetchOwnedToast()


            let apiURI = 'https://api.starflask.com/api/v1/testapikey'
            let inputData = {requestType: 'burned_ERC20_by_token', input: { token:'0xb6ed7644c69416d67b522e20bc294a9a9b405b31' } } 
            let results = await StarflaskAPIHelper.resolveStarflaskQuery(apiURI ,  inputData   )
            console.log('results',results)
            
            let burns = results.output 

            this.burnRowsArray = [] 

            for(let burn of burns){ 

              let hasToast = this.accountHasToast[burn.from.toLowerCase()]

              this.burnRowsArray.push({ from: burn.from,  amount: MathHelper.rawAmountToFormatted(burn.amount,8)  , hasToast: hasToast  })
            }

            for(let [key,value] of Object.entries(this.accountHasToast)){

              let matchingBurnRows = this.burnRowsArray.filter(row => row.from.toLowerCase() == key  )

              if(matchingBurnRows.length == 0 && this.accountHasToast[key.toLowerCase()]){
                this.burnRowsArray.push({ from: key,  amount: MathHelper.rawAmountToFormatted(0,8)  , hasToast: true  })
              }

            }

            this.burnRowsArray = this.burnRowsArray.sort((a,b)=>{return b.amount - a.amount})

 

          },

           async fetchOwnedToast(){

            let apiURI = 'https://api.starflask.com/api/v1/testapikey'
            let inputData = {requestType: 'ERC721_balance_by_contract', input: { contractAddress:'0x9b2214d749f736873b2232a54889342610878651' } } 
            let results = await StarflaskAPIHelper.resolveStarflaskQuery(apiURI ,  inputData  )
            


            this.accountHasToast = {} 


            if(results.success){

              console.log(results )
               for(let row of results.output){
                  this.accountHasToast[row.accountAddress.toLowerCase()] = (row.tokenIds && row.tokenIds.length > 0)
              }
            }
           
            console.log('toast results',this.accountHasToast )
            


            /*let burns = results.output 

            this.burnRowsArray = [] 

            for(let burn of burns){

              this.burnRowsArray.push({from: burn.from,  amount: MathHelper.rawAmountToFormatted(burn.amount,8)   })
            }*/



          },

          onBurnRowClicked(rowData){

            let chainId = this.web3Plug.getActiveNetId()
            if(!chainId) chainId = 1;
 

            let url = this.web3Plug.getExplorerLinkForAddress(rowData.from, chainId)
             window.location.href = url 
          },

          clickedBurnButton(){
            this.$router.push('/burn')

          }

       

  }
}
</script>
