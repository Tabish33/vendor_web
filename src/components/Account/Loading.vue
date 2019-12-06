<template>
    <v-dialog v-model="dialog" persistent width="300" >
        <v-card color="primary" dark>
            <v-card-text dark>
            Please wait
            <v-progress-linear
                indeterminate
                color="white"
                dark
                class="mb-0"
            ></v-progress-linear>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: ["dialog"]
}
</script>