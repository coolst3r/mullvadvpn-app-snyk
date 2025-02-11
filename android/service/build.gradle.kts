plugins {
    id(Dependencies.Plugin.androidLibraryId)
    id(Dependencies.Plugin.kotlinAndroidId)
    id(Dependencies.Plugin.kotlinParcelizeId)
}

android {
    namespace = "net.mullvad.mullvadvpn.service"
    compileSdk = Versions.Android.compileSdkVersion

    defaultConfig { minSdk = Versions.Android.minSdkVersion }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions { jvmTarget = Versions.jvmTarget }

    lint {
        lintConfig = file("${rootProject.projectDir}/config/lint.xml")
        abortOnError = true
        warningsAsErrors = true
    }

    flavorDimensions += FlavorDimensions.BILLING

    productFlavors {
        create(Flavors.OSS) { dimension = FlavorDimensions.BILLING }
        create(Flavors.PLAY) { dimension = FlavorDimensions.BILLING }
    }
}

dependencies {
    implementation(project(Dependencies.Mullvad.commonLib))
    implementation(project(Dependencies.Mullvad.endpointLib))
    implementation(project(Dependencies.Mullvad.ipcLib))
    implementation(project(Dependencies.Mullvad.modelLib))
    implementation(project(Dependencies.Mullvad.resourceLib))
    implementation(project(Dependencies.Mullvad.talpidLib))

    implementation(Dependencies.AndroidX.appcompat)
    implementation(Dependencies.jodaTime)
    implementation(Dependencies.Koin.core)
    implementation(Dependencies.Koin.android)
    implementation(Dependencies.Kotlin.stdlib)
    implementation(Dependencies.KotlinX.coroutinesAndroid)
}
