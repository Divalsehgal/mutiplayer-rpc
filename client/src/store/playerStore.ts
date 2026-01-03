
const getOrCreatePlayerUid = (): string => {
    let uid = sessionStorage.getItem("playerUid");

    if (!uid) {
        // Generate strong UID: name + timestamp + random
        const randomPart = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
        uid = `p_${Date.now()}_${randomPart}`;
        sessionStorage.setItem("playerUid", uid);
    }

    return uid;
}


const getPlayerName = () => {
    return localStorage.getItem("playerName") || "";
}

const setPlayerName = (name: string) => {
    localStorage.setItem("playerName", name);
}


export { getOrCreatePlayerUid, getPlayerName, setPlayerName };