<template>
    <v-card v-if="dialog" class="pa-4 card">
        <v-layout column>
            <v-flex shrink class="x_large bold mt-4">Edit Product</v-flex>
            <hr class="mt-3 mb-2">

            <v-flex><v-text-field label="Name" v-model="edited_product.name"></v-text-field></v-flex>
            <v-flex><v-select :items="getCatgs" v-model="edited_product.category" label="Category"></v-select></v-flex>
            <v-flex ><v-autocomplete :items="vendors"  item-text="name" return-object v-model="edited_product.vendor" label="Vendor"></v-autocomplete></v-flex>
            <v-flex>
                <v-layout row>
                    <v-flex><v-text-field label="Our Rate" v-model="edited_product.price_per_qty"></v-text-field></v-flex>
                    <v-flex>/</v-flex>
                    <v-flex><v-text-field label="Qty" v-model="edited_product.per"></v-text-field></v-flex>
                    <v-flex><v-select :items="getUnits" v-model="edited_product.unit" label="Unit"></v-select></v-flex>
                </v-layout>
            </v-flex>
            <v-flex>
                <v-layout row>
                    <v-flex><v-text-field label="Vendor Rate" v-model="edited_product.vendor_price_per_qty"></v-text-field></v-flex>
                    <v-flex>/</v-flex>
                    <v-flex><v-text-field label="Qty" v-model="edited_product.vendor_per"></v-text-field></v-flex>
                    <v-flex><v-select :items="getUnits" v-model="edited_product.vendor_unit" label="Unit"></v-select></v-flex>
                </v-layout>
            </v-flex>
            <v-flex>
                <v-layout row>
                    <v-flex><v-text-field label="Market Rate" v-model="edited_product.market_price_per_qty"></v-text-field></v-flex>
                    <v-flex>/</v-flex>
                    <v-flex><v-text-field label="Qty" v-model="edited_product.market_per"></v-text-field></v-flex>
                    <v-flex><v-select :items="getUnits" v-model="edited_product.market_unit" label="Unit"></v-select></v-flex>
                </v-layout>
            </v-flex>
            <v-flex>
                <v-combobox v-model="edited_product.search_terms"  :items="edited_product.search_terms" label="Search Terms" chips clearable solo multiple>
                    <v-chips v-for="(term,index) in edited_product.search_terms" :key="index" >
                        {{term}}
                    </v-chips>
                </v-combobox>
            </v-flex>
            <v-flex>
                <img width="350px" :src="edited_product.image_url" />
                <upload-btn block outline @file-update="saveLogo" label="Choose Image">Choose Image</upload-btn>
            </v-flex>
            <v-flex><v-textarea label="Description" v-model="edited_product.desc"></v-textarea></v-flex>
            <v-flex><v-btn @click="save()" dark block color="rgb(0, 133, 119)" class="capitalize bold">Save</v-btn></v-flex>

            <v-flex v-show="false">
                <loading :dialog="loading_dialog"></loading>
            </v-flex>
        </v-layout>
    </v-card>
</template>

<script>
import firebase from "firebase"
import { storeDb } from '../firebase/init'
import UploadButton from "vuetify-upload-button";
import Loading from "./Loading"

export default {
    components: {
        "upload-btn": UploadButton,
        "loading": Loading
    },

    props : ["product","dialog"],

    data(){
        return{
            edited_product:null,
            units: ["KG", "GM", "L","ML", "Pc"],
            catg_units: ["VEG","NONVEG"],
            image: null,
            vendors: [],
            loading_dialog:false
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
            this.loading_dialog = true
            this.correctFields();
            await this.updateOnBackend();  
            this.$emit("editProduct", this.edited_product)   
            this.loading_dialog = false  
        },

        saveLogo(file){
            this.image = file
        },

        async uploadImage(){
            if (!this.image) return ;

            let file = this.image
            let ref = `vendor_prouct_images/${this.edited_product.id}`;
            let url = await this.$store.dispatch("uploadImage",{ref,file});
            this.edited_product.image_url = url;
        },


        correctFields(){
            this.edited_product.price_per_qty = parseFloat(this.edited_product.price_per_qty)
            this.edited_product.per = parseFloat(this.edited_product.per)
            this.edited_product.market_price_per_qty = parseFloat(this.edited_product.market_price_per_qty)
            this.edited_product.market_per = parseFloat(this.edited_product.market_per)
            this.edited_product.vendor_price_per_qty = parseFloat(this.edited_product.vendor_price_per_qty)
            this.edited_product.vendor_per = parseFloat(this.edited_product.vendor_per)
        },

        async updateOnBackend(){
            await this.uploadImage();
            let uid = await firebase.auth().currentUser.uid;
            let ref = `Vendors/${uid}/products`
            let id = his.edited_product.id.toString()
            await this.$store.dispatch("updateOnDb", {id, ref, "data": this.edited_product })
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

    watch:{
        dialog(val){
            if (val) {
                this.edited_product = JSON.parse(JSON.stringify(this.product))
                console.log("edited", this.edited_product);
                
            }
        }
    },

    created(){
        this.getVendors()
    }
}
</script>