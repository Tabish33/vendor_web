<template>
    <v-card class="pa-4 card">
        <v-layout column>
            <v-flex class="text-xs-right"><v-icon @click="exit()" class="pointer">cancel</v-icon></v-flex>
            <v-flex>
                 <v-flex shrink><v-switch v-model="offer.active" color="rgb(0, 133, 119)"></v-switch></v-flex>
            </v-flex>
            <v-flex>
                <v-text-field label="Title" v-model="offer.title"></v-text-field>
            </v-flex>
            <v-flex>
                <v-text-field label="SubTitle" v-model="offer.subtitle"></v-text-field>
            </v-flex>
            <v-flex>
                <v-text-field label=" Offer Type" v-model="offer.type"></v-text-field>
            </v-flex>
            <v-flex>
                <v-autocomplete item-text="name" multiple :items="products" return-object label="Items" v-model="items"></v-autocomplete>
            </v-flex>
            <v-flex>
                <img width="350px" :src="offer.image_url" />
                <upload-btn block outline @file-update="saveLogo" label="Choose Image">Choose Image</upload-btn>
            </v-flex>
            <v-flex>
                <v-btn @click="createOffer()" block dark color="rgb(0, 133, 119)" class="capitalize bold">
                    Create Offer
                </v-btn>
            </v-flex>

            <v-flex v-show="false">
                <loading :dialog="loading_dialog"></loading>
            </v-flex>
        </v-layout>
    </v-card>
</template>

<script>
import firebase from "firebase"
import { storeDb } from '../firebase/init'
import moment from "moment"
import Loading from "./Loading"
import UploadButton from "vuetify-upload-button";
export default {
    components:{
        "loading": Loading,
        "upload-btn": UploadButton,
    },

    data(){
        return {
            offer : { offer_type: "vendor"},
            items: [],
            products: [],
            loading_dialog: false,
            image:null
        }
    },

    methods: {
        async createOffer(){
            this.loading_dialog = true

            let id = moment().valueOf().toString();
            this.offer.id = id;
            let ref = `offers`

            await this.uploadImage()

            for (let i = 0; i < this.items.length; i++) {
                const item = this.items[i];
                await this.$store.dispatch("addToDb",{"ref":`${ref}/${id}/items`, "id":item.id.toString(), "data": item })
            }
            await this.$store.dispatch("addToDb",{ref,"id":id.toString(),"data": this.offer})
            
            let offer = {}
            offer.details  = this.offer;
            offer.items = this.items
            this.$emit("offerCreated",  this.deepCopy(offer))
            this.sendOfferNotification()
            this.resetData()
            this.loading_dialog = false
        },

        sendOfferNotification(){
            let offer = this.deepCopy(this.offer)
            var sendOfferNotification = firebase
            .functions()
            .httpsCallable("sendOfferNotification");

            sendOfferNotification({ offer });
        },

        saveLogo(file){
            this.image = file
        },
        
        async uploadImage(){
            let file = this.image
            let ref = `vendor_offers/${this.offer.id}`;
            let url = await this.$store.dispatch("uploadImage",{ref,file});
            this.offer.image_url = url;
        },
        
        exit(){
            this.resetData();
            this.$emit("exit");
        },

        resetData(){
            this.offer = { offer_type: "vendor"}
            this.items = []
        },

        deepCopy(obj){
            return JSON.parse(JSON.stringify(obj))
        },

        async getInventory(){
            if(this.products.length != 0) return

            let uid = await firebase.auth().currentUser.uid;
            let ref = `Vendors/${uid}/products`
            let products_snap = await storeDb.collection(ref).get()

            products_snap.forEach(doc=>{
                let product = doc.data()
                this.products.push(product);
            })
        },
    },

    created(){
        this.getInventory()
    }
}
</script>