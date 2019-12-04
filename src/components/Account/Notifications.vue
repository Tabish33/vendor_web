<template>
    <v-layout fill-height column>
        <v-flex shrink>
            <v-layout column>
                <v-card flat>
                    <v-flex>
                        <v-layout>
                            <v-flex class="x_large bold mt-4">Notifications</v-flex>
                            <v-flex class="" shrink>
                                 <v-btn @click="show_notifications_dialog=true" dark color="rgb(0, 133, 119)" class="capitalize bold">Send Notification <v-icon>notifications</v-icon></v-btn>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    
                    <hr class="mt-3 mb-2">
                </v-card>
            </v-layout>
        </v-flex>
        <v-flex v-if="products.length > 0" class="mt-2">
            <v-layout wrap>
                <v-flex md4 class="mt-2 pa-2" shrink v-for="(product,i) in products" :key="i">
                    <v-card class="pa-3 card" style="height:187px">
                        <v-layout>
                            <v-flex shrink><img :src="product.image_url" height="100" width="auto"></v-flex>
                            <v-flex>
                                <v-layout class="bold pa-3" column>
                                    <v-flex>
                                        <v-layout>
                                            <v-flex shrink style="color:grey">{{product.name}}</v-flex>
                                            <v-spacer></v-spacer>
                                            <v-flex @click="showEditProductDialog(product)" class="pointer" shrink><v-icon color="rgb(0, 133, 119)">edit</v-icon></v-flex>
                                        </v-layout>
                                    </v-flex>
                                    <v-flex style="color:grey">{{product.category}}</v-flex>
                                    <v-flex style="color:grey" class="mb-1">₹{{product.price_per_qty}}/{{product.per}} {{product.unit}}</v-flex>
                                    <v-flex style="color:grey;">{{product.desc.slice(0,80)}}...</v-flex>
                                </v-layout>
                            </v-flex>
                        </v-layout>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-flex>
        <!-- ADD ITEM -->
        <v-flex style="position:fixed;right:15px;bottom:15px;z-index:30">
            <v-btn @click="add_product_dialog = true" large fab dark color="warning">
                <v-icon dark>add</v-icon>
            </v-btn>
        </v-flex>
        <!-- DIALOGS -->
        <v-flex v-show="false">
            <v-dialog hide-overlay persistent width="400" v-model="select_res_branch_dialog">
                <v-card class="pa-4">
                    <v-layout column>
                        <v-flex>
                            <v-autocomplete item-text="name" return-object :items="restaurants" label="Select Restaurant" v-model="selected_res"></v-autocomplete>
                        </v-flex>
                         <v-flex v-if="selected_res">
                            <v-autocomplete item-text="name" item-value="name" :items="branches" label="Select Branch" v-model="selected_branch"></v-autocomplete>
                        </v-flex>
                         <v-flex>
                            <v-btn @click="getMostSellingItems()" block dark class="capitalize bold" color="rgb(0, 133, 119)">Get Most Selling Items</v-btn>
                        </v-flex>
                    </v-layout>
                </v-card>
            </v-dialog>

            <v-dialog width="400" v-model="show_notifications_dialog">
                <v-card class="pa-4">
                    <v-layout column>
                        <v-flex>
                            <v-text-field label="Title" v-model="notf.title"></v-text-field>
                        </v-flex>
                        <v-flex>
                            <v-text-field label="Subtitle" v-model="notf.subtitle"></v-text-field>
                        </v-flex>
                        <v-flex>
                            <img :src="notf.image_url" />
                            <upload-btn block outline @file-update="saveLogo" label="Choose Image">Choose Image</upload-btn>
                        </v-flex>
                        <v-flex>
                            <v-btn @click="sendNotification()" dark block color="rgb(0, 133, 119)" class="capitalize bold" >
                                Send Notification
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </v-card>
            </v-dialog>
        </v-flex>
    </v-layout>
</template>

<script>
import UploadButton from "vuetify-upload-button";
import { storeDb } from '../firebase/init'
import firebase from "firebase"
import moment from "moment"
export default {
    components: {
        "upload-btn": UploadButton
    },
    
    data(){
        return{
            products: [],
            restaurants: [],
            branches: [],
            select_res_branch_dialog: true,
            show_notifications_dialog: false,
            selected_res: null,
            selected_branch: null,
            image: null,

            notf: {}
        }
    },

    methods:{
      async getRestaurants(){
          let res_snap = await storeDb.collection("businesses").get()
          res_snap.forEach(doc=>{
              let res = doc.data()
              res.uid = doc.id
              this.restaurants.push(res)
          })
      },
      
      async getBranches(){
          let branches_snap = await storeDb.collection(`businesses/${this.selected_res.uid}/branches`).get()
          branches_snap.forEach(doc=>{
              let branch = doc.id
              this.branches.push(branch)
          })
      },

      saveLogo(file){
          this.image = file
      },
      
      async getMostSellingItems(){
        let uid = this.selected_res.uid
        let branch = this.selected_branch
        let date = this.$store.getters.getDate
        console.log({ uid, branch, date });
        
        var generateVendorItemSuggestions = firebase
            .functions()
            .httpsCallable("generateVendorItemSuggestions");

        let items = await generateVendorItemSuggestions({ uid, branch, date });
        console.log("items",items);
                
        items.data.forEach(item=>{
            this.products.push(item)
        })
        
        this.select_res_branch_dialog = false
        
      },

      async uploadImage(){
            let file = this.image
            let id = moment().valueOf()
            let logo_ref = firebase.storage().ref(`best_vendor_deals/${id}`);
            let snap = await logo_ref.put(file);
            let image_url = await snap.ref.getDownloadURL()
            this.notf.image = image_url;
        },

      async sendNotification(){
        await this.uploadImage()
        let uid = this.selected_res.uid
        let branch = this.selected_branch

        console.log(uid,branch,this.notf);
        
        
        var sendBestDeals = firebase
            .functions()
            .httpsCallable("sendBestDeals");

         sendBestDeals({ uid, branch, data: this.notf });

         this.show_notifications_dialog = false
      }
    },

    watch:{
        selected_res(val){
            if (val) {
                this.getBranches()
            }
        }
    },

    created(){
        this.getRestaurants()
    }
}
</script>