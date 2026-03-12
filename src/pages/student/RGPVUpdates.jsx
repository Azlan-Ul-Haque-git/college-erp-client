import { useEffect, useState } from "react";
import api from "../../utils/axiosInstance";

export default function RGPVUpdates() {

    const [notices, setNotices] = useState([]);

    useEffect(() => {

        const load = async () => {

            try {
                const { data } = await api.get("/notifications/rgpv");
                setNotices(data.data || []);
            } catch { }

        };

        load();

    }, []);

    return (

        <div className="card space-y-3">

            <h2 className="text-lg font-bold">📢 RGPV Updates</h2>

            {notices.length === 0 ? (
                <p className="text-sm text-gray-400">No updates</p>
            ) : (

                notices.slice(0, 5).map(n => (

                    <div key={n._id} className="border-b pb-2">

                        <p className="text-sm font-semibold">{n.title}</p>

                        <a
                            href={n.link}
                            target="_blank"
                            className="text-xs text-blue-500"
                        >
                            View Notice
                        </a>

                    </div>

                ))

            )}

        </div>

    );

}