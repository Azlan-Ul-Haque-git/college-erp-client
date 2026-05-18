export default function DownloadApp() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full bg-white/10 border border-white/20 rounded-3xl p-8 text-center backdrop-blur-xl">

                <h1 className="text-3xl font-bold text-white mb-3">
                    College ERP App
                </h1>

                <p className="text-white/60 mb-6">
                    Download latest Android APK
                </p>

                <a
                    href="/college-erp.apk"
                    download
                    className="block w-full bg-purple-600 hover:bg-purple-700 transition text-white font-semibold py-3 rounded-xl"
                >
                    Download APK
                </a>

                <p className="text-white/30 text-xs mt-4">
                    Latest Version
                </p>

            </div>
        </div>
    );
}