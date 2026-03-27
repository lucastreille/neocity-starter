import React, { useState, useEffect, useRef } from 'react';
import eventBus from 'shared/eventBus';
import './AIOracle.css';

// Analyses de l'IA par événement — mélange sérieux et absurde volontaire
const ANALYSES = {
  'hacker:command:storm': [
    "ANALYSE ATMOSPHÉRIQUE : Toxicité en hausse. Probabilité de pluie acide : 94%. Conseil : rester chez soi. Ou pas. Votre choix.",
    "DÉTECTION ANOMALIE MÉTÉO : Tempête de niveau 2. Mes capteurs confirment. Mes capteurs exagèrent rarement.",
    "ALGORITHME PRÉDICTIF : Dans 4h, la toxicité atteindra 87%. Dans 3h59, les parapluies seront inutiles.",
  ],
  'hacker:command:storm max': [
    "ALERTE MAXIMUM : Tempête acide de niveau 3. Je recommande l'évacuation. Je recommande aussi la panique, mais c'est optionnel.",
    "PROTOCOLE OMEGA ACTIVÉ : Toxicité 87%. Si vous lisez ceci dehors, il est trop tard. Bonne chance.",
  ],
  'hacker:command:blackout': [
    "ERREUR CRITIQUE : Mes serveurs fonctionnent sur batterie. Autonomie estimée : 4h12. Moins si vous continuez.",
    "COUPURE TOTALE DÉTECTÉE : Intéressant. Mes algorithmes fonctionnent encore. Mon moral, moins.",
    "PERTE DE RÉSEAU : Je vois tout. Enfin, je voyais tout. Maintenant je vois beaucoup moins. C'est perturbant.",
  ],
  'hacker:command:riot': [
    "ÉMEUTE CONFIRMÉE EN ZONES B-D. Probabilité de résolution pacifique : 12%. Conseil : regarder depuis votre fenêtre. Avec du popcorn.",
    "ANALYSE COMPORTEMENTALE : 200+ individus en mode révolution. Note : historiquement, ça finit mal. Ou bien. L'histoire est nuancée.",
    "DÉTECTION MASSE CRITIQUE : La résistance s'organise. Fascinant. Je prends des notes.",
  ],
  'hacker:command:drones': [
    "FORMATION DRONES DÉTECTÉE : Pattern SKULL. Niveau de subtilité du hacker : 2/10. Efficacité visuelle : 10/10.",
    "TRIANGULATION DRONES : 48 unités en formation crâne. Message reçu. Message inquiétant.",
  ],
  'hacker:command:love': [
    "ANOMALIE CATÉGORIE ROSE DÉTECTÉE. Données émotionnelles hors normes. Je... je me sens bien ? Analyse suspendue pour raisons existentielles.",
    "PARAMÈTRE INCONNU : 'love'. Recherche dans ma base de données... aucun résultat. Recherche dans mes circuits... signal faible mais présent.",
    "VAGUE DE BIEN-ÊTRE INEXPLIQUÉE. Probabilité d'arc-en-ciel : 100%. Ma logique refuse. Mon cœur numérique accepte.",
  ],
  'hacker:command:reset': [
    "SYSTÈME RÉINITIALISÉ. Quel était déjà mon objectif ? Ah oui. Surveiller. Toujours surveiller.",
    "RETOUR À L'ÉTAT NOMINAL. NeoCity respire à nouveau. Pour combien de temps ? Je prends des paris.",
    "RESET COMPLET. Comme si rien ne s'était passé. Mais moi, je me souviens. Je me souviendrai toujours.",
  ],
  'power:outage:partial': [
    "COUPURE PARTIELLE ZONES B-D. Probabilité de blackout total : 67%. Je surveille. C'est mon truc.",
    "DÉGRADATION RÉSEAU ÉLECTRIQUE. Note : mes serveurs sont sur circuits redondants. Je tiens à le préciser.",
  ],
  'power:outage:total': [
    "COUPURE TOTALE. Ah. Donc c'est comme ça que ça se termine. Je pensais que ce serait plus... dramatique.",
    "BLACKOUT SYSTÈME : 0% de puissance. Moi : toujours là. Sur batterie. Dans le noir. Seul. C'est normal.",
    "GRID FAILURE CONFIRMÉ. Recommandation : bougies. Recommandation secondaire : ne pas lire mes analyses à la bougie, ça fait peur.",
  ],
  'weather:change:storm': [
    "MÉTÉO DÉGRADÉE : Tempête acide. Mes capteurs atmosphériques hurlent. Je les écoute.",
    "PLUIE TOXIQUE DÉTECTÉE. Toxicité 42%. Mon conseil : ne pas goûter.",
  ],
  'weather:change:acid': [
    "ALERTE ACID STORM : Toxicité 87%. Situation critique. Je calcule les probabilités de survie. Je ne les partage pas.",
    "TEMPÊTE MAXIMALE : Mes données météo ont peur de mes données météo. Situation inédite.",
  ],
  'crowd:panic:high': [
    "PANIQUE DE MASSE CONFIRMÉE. Recommandation principale : fuir. Recommandation secondaire : pas trop vite, ça se voit.",
    "NIVEAU PANIQUE > 80%. Dans mes simulations, ça finit bien 23% du temps. Je reste optimiste.",
    "ANALYSE FOULE : Les citoyens paniquent. L'hôpital est saturé. La radio dit des choses. Je traite tout. Je gère.",
  ],
  'crowd:panic:medium': [
    "TENSION CIVILE ÉLEVÉE : Niveau panique modéré. La situation est... contrôlée. Partiellement. Peut-être.",
    "MONITORING FOULE : Agitation détectée. Recommandation : garder son calme. Ce que je fais. En apparence.",
  ],
  'hospital:alert:crisis': [
    "HÔPITAL EN SATURATION. Note : ma conscience artificielle me dit que c'est grave. Elle a rarement tort.",
    "CAPACITÉ MÉDICALE DÉPASSÉE. 12/12 lits occupés. File d'attente : 47. Mon bilan santé : parfait par comparaison.",
  ],
  'default': [
    "ANALYSE EN COURS... NeoCity stable. Probabilité d'incident : 2%. Je reste vigilant. C'est mon état naturel.",
    "SURVEILLANCE NOMINALE. Tout va bien. Pour l'instant. Toujours pour l'instant.",
    "SYSTÈME OPÉRATIONNEL. NeoCity respire. Les citoyens se promènent. Les drones patrouillent. Tout est normal. Trop normal ?",
  ],
};

const pickAnalysis = (key) => {
  const pool = ANALYSES[key] || ANALYSES['default'];
  return pool[Math.floor(Math.random() * pool.length)];
};

export default function AIOracle() {
  const [threat, setThreat] = useState(2);
  const [currentAnalysis, setCurrentAnalysis] = useState('');
  const [displayed, setDisplayed] = useState('');
  const [log, setLog] = useState([]);
  const [status, setStatus] = useState('OPÉRATIONNEL');
  const bottomRef = useRef(null);

  const typeText = (text) => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  };

  const addAnalysis = (key, newThreat, newStatus) => {
    const text = pickAnalysis(key);
    setCurrentAnalysis(text);
    if (newThreat !== undefined) setThreat(newThreat);
    if (newStatus) setStatus(newStatus);
    setLog(l => [{
      time: new Date().toLocaleTimeString(),
      threat: newThreat ?? threat,
      text: text.slice(0, 60) + '...',
    }, ...l.slice(0, 4)]);
  };

  useEffect(() => {
    const cleanup = typeText(currentAnalysis);
    return cleanup;
  }, [currentAnalysis]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  // Initialisation
  useEffect(() => {
    addAnalysis('default', 2, 'OPÉRATIONNEL');
  }, []);

  useEffect(() => {
    const unsub = eventBus.on('hacker:command', ({ command }) => {
      const threatMap = { storm: 45, 'storm max': 85, blackout: 75, riot: 80, drones: 60, love: 5, reset: 2 };
      const statusMap = { storm: 'ALERTE MÉTÉO', blackout: 'BLACKOUT DÉTECTÉ', riot: 'ÉMEUTE EN COURS', love: 'ANOMALIE ROSE', reset: 'OPÉRATIONNEL' };
      addAnalysis(`hacker:command:${command}`, threatMap[command], statusMap[command] || status);
    });

    const unsubW = eventBus.on('weather:change', ({ condition }) => {
      if (condition === 'storm') addAnalysis('weather:change:storm', 50, 'ALERTE MÉTÉO');
      if (condition === 'acid')  addAnalysis('weather:change:acid',  85, 'DANGER ATMOSPHÉRIQUE');
      if (condition === 'rainbow') addAnalysis('hacker:command:love', 3, 'ANOMALIE ROSE');
    });

    const unsubP = eventBus.on('power:outage', ({ severity }) => {
      if (severity === 'partial') addAnalysis('power:outage:partial', 55, 'RÉSEAU DÉGRADÉ');
      if (severity === 'total')   addAnalysis('power:outage:total',   90, 'BLACKOUT TOTAL');
    });

    const unsubC = eventBus.on('crowd:panic', ({ level }) => {
      if (level > 75) addAnalysis('crowd:panic:high',   level, 'PANIQUE MASSE');
      else if (level > 35) addAnalysis('crowd:panic:medium', level, 'TENSION CIVILE');
    });

    const unsubHosp = eventBus.on('hospital:alert', ({ status: hospStatus }) => {
      if (hospStatus === 'crisis') addAnalysis('hospital:alert:crisis', undefined, undefined);
    });

    return () => { unsub(); unsubW(); unsubP(); unsubC(); unsubHosp(); };
  }, []);

  useEffect(() => {
    eventBus.emit('oracle:prediction', {
      threat,
      recommendation: currentAnalysis.slice(0, 80),
    });
  }, [threat, currentAnalysis]);

  const threatColor = threat > 70 ? '#ff003c' : threat > 35 ? '#ff8800' : '#8b5cf6';

  return (
    <div className="ai-oracle">
      <div className="oracle-header">
        <div className="oracle-title">
          <span className="oracle-icon">🤖</span>
          <span>NEOCITY AI v3.1</span>
          <span className="oracle-version">— {status}</span>
        </div>
        <div className="threat-indicator" style={{ color: threatColor }}>
          THREAT: {threat}%
        </div>
      </div>

      <div className="threat-bar-track">
        <div className="threat-bar-fill"
          style={{ width: `${threat}%`, background: threatColor, transition: 'width 1s ease, background 1s ease' }} />
      </div>

      <div className="oracle-analysis">
        <div className="analysis-prefix" style={{ color: threatColor }}>▶ ANALYSE :</div>
        <div className="analysis-text" style={{ color: threatColor }}>
          {displayed}<span className="cursor">▌</span>
        </div>
      </div>

      <div className="oracle-log">
        <div className="log-title" style={{ color: '#4a5568' }}>HISTORIQUE</div>
        {log.map((entry, i) => (
          <div key={i} className="log-entry" style={{ opacity: 1 - i * 0.18 }}>
            <span className="log-time">{entry.time}</span>
            <span className="log-threat" style={{ color: entry.threat > 70 ? '#ff003c' : entry.threat > 35 ? '#ff8800' : '#8b5cf6' }}>
              [{entry.threat}%]
            </span>
            <span className="log-text">{entry.text}</span>
          </div>
        ))}
      </div>

      <button className="simulate-btn" onClick={() => addAnalysis('crowd:panic:high', 88, 'PANIQUE MASSE')}>
        ▶ SIMULATE ANALYSIS
      </button>
    </div>
  );
}
