<template>
    <v-card class="pa-4 card">
        <v-layout column>
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
                <v-btn @click="createOffer()" block dark color="rgb(0, 133, 119)" class="capitalize bold">
                    Create Offer
                </v-btn>
            </v-flex>
        </v-layout>
    </v-card>
</template>

<script>
import firebase from "firebase"
import { storeDb } from '../firebase/init'
import moment from "moment"
export default {

    data(){
        return {
            offer : { offer_type: "vendor"},
            items: [],
            products: []
        }
    },

    methods: {
        async createOffer(){
            let id = moment().valueOf()
            let ref = `offers`

            for (let i = 0; i < this.items.length; i++) {
                const item = this.items[i];
                await storeDb.collection(`${ref}/${id}/items`).doc(item.id.toString()).set(item)
            }

            await storeDb.collection(ref).doc(id.toString()).set(this.offer)

            this.resetData()
            this.$emit("offerCreated")
        },

        resetData(){
            this.offer = { offer_type: "vendor"}
            this.items = []
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