/**
 * Formate une date en temps relatif (Ex: "Aujourd'hui", "Hier", "Il y a 3 jours")
 * @param dateString - La date au format ISO ou string compatible Date
 * @returns Une chaîne formatée
 */
export const getRelativeTime = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    // On compare les jours au lieu des millisecondes pour éviter les décalages de quelques heures
    const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = startOfNow.getTime() - startOfDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 30) return `Il y a ${diffDays} jours`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return `Il y a ${Math.floor(diffDays / 365)} an(s)`;
};
