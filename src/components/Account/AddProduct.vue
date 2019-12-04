<template>
    <v-card  class="pa-4 card">
        <v-layout column>
            <v-flex shrink class="x_large bold mt-4">Add Product</v-flex>
            <hr class="mt-3 mb-2">

            <v-flex><v-text-field label="Name" v-model="new_product.name"></v-text-field></v-flex>
            <v-flex><v-select :items="getCatgs" v-model="new_product.category" label="Category"></v-select></v-flex>
            <v-flex ><v-autocomplete :items="vendors"  item-text="name" return-object v-model="new_product.vendor" label="Vendor"></v-autocomplete></v-flex>
            <v-flex>
                <v-layout row>
                    <v-flex><v-text-field label="Our Rate" v-model="new_product.price_per_qty"></v-text-field></v-flex>
                    <v-flex>/</v-flex>
                    <v-flex><v-text-field label="Qty" v-model="new_product.per"></v-text-field></v-flex>
                    <v-flex><v-select :items="getUnits" v-model="new_product.unit" label="Unit"></v-select></v-flex>
                </v-layout>
            </v-flex>
            <v-flex>
                <v-layout row>
                    <v-flex><v-text-field label="Vendor Rate" v-model="new_product.vendor_price_per_qty"></v-text-field></v-flex>
                    <v-flex>/</v-flex>
                    <v-flex><v-text-field label="Qty" v-model="new_product.vendor_per"></v-text-field></v-flex>
                    <v-flex><v-select :items="getUnits" v-model="new_product.vendor_unit" label="Unit"></v-select></v-flex>
                </v-layout>
            </v-flex>
            <v-flex>
                <v-layout row>
                    <v-flex><v-text-field label="Market Rate" v-model="new_product.market_price_per_qty"></v-text-field></v-flex>
                    <v-flex>/</v-flex>
                    <v-flex><v-text-field label="Qty" v-model="new_product.market_per"></v-text-field></v-flex>
                    <v-flex><v-select :items="getUnits" v-model="new_product.market_unit" label="Unit"></v-select></v-flex>
                </v-layout>
            </v-flex>
            <v-flex>
                <v-combobox v-model="new_product.search_terms"  :items="new_product.search_terms" label="Search Terms" chips clearable solo multiple>
                    <v-chips v-for="(term,index) in new_product.search_terms" :key="index" >
                        {{term}}
                    </v-chips>
                </v-combobox>
            </v-flex>
            <v-flex>
                <img width="350px" :src="new_product.image_url" />
                <upload-btn block outline @file-update="saveLogo" label="Choose Image">Choose Image</upload-btn>
            </v-flex>
            <v-flex><v-textarea label="Description" v-model="new_product.desc"></v-textarea></v-flex>
            <v-flex><v-btn @click="save()" dark block color="rgb(0, 133, 119)" class="capitalize bold">Save</v-btn></v-flex>
        </v-layout>
    </v-card>
</template>

<script>
import UploadButton from "vuetify-upload-button";
import firebase from "firebase"
import { storeDb } from '../firebase/init'
import moment from "moment"

export default {
    components: {
        "upload-btn": UploadButton
    },

    data(){
        return{
            new_product: { vendor:{}, search_terms:[]},
            image: null,
            vendors: []
        }
    },

    computed: {
        getCatgs(){
            return this.$store.getters.getCategories
        },

        getUnits(){
            return this.$store.getters.getUnits
        },

        getType(){
            return this.$store.getters.getType
        }
    },

    methods: {
        async save(){
            console.log(this.new_product);  
            this.correctFields();
            await this.saveOnBackend();  
            this.$emit("addProduct", this.deepCopy(this.new_product)) 
            this.resetData() 
        },

        resetData(){
            this.new_product = {}   
            this.image = null
        },

        deepCopy(obj){
            return JSON.parse(JSON.stringify(obj))
        },

        correctFields(){
            this.new_product.price_per_qty = parseFloat(this.new_product.price_per_qty)
            this.new_product.per = parseFloat(this.new_product.per)
            this.new_product.market_price_per_qty = parseFloat(this.new_product.market_price_per_qty)
            this.new_product.market_per = parseFloat(this.new_product.market_per)
            this.new_product.vendor_price_per_qty = parseFloat(this.new_product.vendor_price_per_qty)
            this.new_product.vendor_per = parseFloat(this.new_product.vendor_per)
            this.new_product.id = moment().valueOf()
        },
          
        saveLogo(file){
            this.image = file
        },  

        async saveOnBackend(){
            await this.uploadImage()
            console.log(this.new_product);
            
            let uid = await firebase.auth().currentUser.uid;
            
            let rello_ref = `Vendors/${uid}/products`
            await storeDb.collection(rello_ref).doc(this.new_product.id.toString()).set(this.new_product)

            let vendor_ref = `Vendors/${this.new_product.vendor.uid}/products`
            await storeDb.collection(vendor_ref).doc(this.new_product.id.toString()).set(this.new_product)
        },

        async uploadImage(){
            let file = this.image
            let logo_ref = firebase.storage().ref(`vendor_prouct_images/${this.new_product.id}`);
            let snap = await logo_ref.put(file);
            this.new_product.image_url = await snap.ref.getDownloadURL()
        },

        async getVendors(){
            let vendors_snap = await storeDb.collection("Vendors").get()
            let vendors = []
            vendors_snap.forEach(doc=>{
                let vendor = doc.data();
                vendor.uid  = doc.id;
                vendors.push(vendor);
            })
            
            this.vendors = vendors
        }
    },



    created(){
        this.getVendors()
    }
}
</script>