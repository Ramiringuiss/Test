function ajustarBrillo(hex, cantidad) {
  const num = parseInt(hex.replace("#",""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + cantidad));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + cantidad));
  const b = Math.max(0, Math.min(255, (num & 0xff) + cantidad));
  return `rgb(${r},${g},${b})`;
}

export default function PersonajeSVG({ tonoPiel, prendas }) {
  const piel = tonoPiel?.color || "#F1C27D";
  const pielOscura = tonoPiel ? ajustarBrillo(tonoPiel.color, -30) : "#C68642";

  const cabeza  = prendas["cabeza"];
  const cuerpo  = prendas["cuerpo"];
  const pies    = prendas["pies"];
  const accCara = prendas["acc_cara"];
  const accMov  = prendas["acc_mov"];

  return (
    <svg viewBox="0 0 120 220" width="120" height="220" xmlns="http://www.w3.org/2000/svg">
      {/* Silla de ruedas */}
      {accMov?.id === "silla_ruedas" && (
        <g>
          <circle cx="38" cy="185" r="18" fill="none" stroke="#0288D1" strokeWidth="4"/>
          <circle cx="82" cy="185" r="18" fill="none" stroke="#0288D1" strokeWidth="4"/>
          <rect x="32" y="155" width="56" height="28" rx="4" fill="#0288D1" opacity="0.3"/>
          <rect x="28" y="148" width="64" height="10" rx="3" fill="#0288D1"/>
          <rect x="86" y="130" width="6" height="30" rx="2" fill="#0288D1"/>
          <rect x="28" y="130" width="6" height="30" rx="2" fill="#0288D1"/>
        </g>
      )}

      {/* Bastón */}
      {accMov?.id === "baston" && (
        <line x1="90" y1="110" x2="105" y2="210" stroke="#795548" strokeWidth="5" strokeLinecap="round"/>
      )}

      {/* Cuerpo */}
      {!cuerpo && (
        <rect x="35" y="100" width="50" height="65" rx="6" fill={piel}/>
      )}
      {cuerpo?.id === "camiseta_costa" && (
        <g>
          {/* Torso dividido: camiseta arriba y short abajo para evitar franja de piel */}
          <rect x="35" y="100" width="50" height="45" rx="6" fill="#29B6F6"/>
          <rect x="35" y="145" width="50" height="20" rx="6" fill="#0277BD"/>
          <line x1="42" y1="115" x2="78" y2="115" stroke="white" strokeWidth="2" opacity="0.6"/>
          <line x1="42" y1="123" x2="78" y2="123" stroke="white" strokeWidth="2" opacity="0.6"/>
          {/* detalle tiro short */}
          <line x1="58" y1="150" x2="58" y2="162" stroke="#015179" strokeWidth="2" opacity="0.9"/>
        </g>
      )}
      {cuerpo?.id === "poncho_sierra" && (
        <g>
          <rect x="35" y="100" width="50" height="65" rx="6" fill={piel}/>
          {/* Poncho más amplio: cubre torso y parte superior de piernas */}
          <path d="M35 105 Q60 88 85 105 L85 165 Q60 155 35 165 Z" fill="#AB47BC"/>
          <line x1="40" y1="120" x2="80" y2="120" stroke="#FFD600" strokeWidth="2"/>
          <line x1="44" y1="136" x2="76" y2="136" stroke="#FF6B35" strokeWidth="2"/>
        </g>
      )}
      {cuerpo?.id === "cushma_selva" && (
        <g>
          <rect x="35" y="100" width="50" height="65" rx="6" fill={piel}/>
          {/* Cushma estilo 'niño de la selva' con patrón y bolsa de plantas */}
          <rect x="33" y="98" width="54" height="78" rx="10" fill="#66BB6A"/>
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={i} x1={36} y1={110 + i * 12} x2={84} y2={110 + i * 12} stroke="#4CAF50" strokeWidth="1" opacity="0.6" />
          ))}
          <rect x="40" y="124" width="40" height="8" rx="4" fill="#6D4C41"/>
          <circle cx="58" cy="132" r="3" fill="#FFD600"/>
          <g transform="translate(10,128)">
            <rect x="0" y="8" width="14" height="22" rx="3" fill="#6D4C41"/>
            <path d="M7 0 C2 6, 2 6, 7 12 C12 6, 12 6, 7 0" fill="#2E7D32"/>
            <path d="M7 2 C4 6, 4 6, 7 10 C10 6, 10 6, 7 2" fill="#66BB6A" opacity="0.9"/>
          </g>
        </g>
      )}

      {/* Brazos */}
      <rect x="18" y="103" width="18" height="40" rx="7" fill={cuerpo ? (cuerpo.color || piel) : piel}/>
      <rect x="84" y="103" width="18" height="40" rx="7" fill={cuerpo ? (cuerpo.color || piel) : piel}/>
      <ellipse cx="27" cy="147" rx="9" ry="8" fill={piel}/>
      <ellipse cx="93" cy="147" rx="9" ry="8" fill={piel}/>

      {/* Piernas */}
      <rect x="40" y="163" width="16" height="35" rx="5" fill={pielOscura}/>
      <rect x="64" y="163" width="16" height="35" rx="5" fill={pielOscura}/>
      
      {!pies && (
        <>
          <ellipse cx="48" cy="200" rx="12" ry="7" fill={pielOscura}/>
          <ellipse cx="72" cy="200" rx="12" ry="7" fill={pielOscura}/>
        </>
      )}
      {pies?.id === "sandalias" && (
        <>
          <ellipse cx="48" cy="200" rx="13" ry="7" fill="#FF7043"/>
          <ellipse cx="72" cy="200" rx="13" ry="7" fill="#FF7043"/>
          <line x1="40" y1="196" x2="56" y2="196" stroke="#BF360C" strokeWidth="2"/>
          <line x1="64" y1="196" x2="80" y2="196" stroke="#BF360C" strokeWidth="2"/>
        </>
      )}
      {pies?.id === "ojotas" && (
        <>
          <ellipse cx="48" cy="200" rx="13" ry="7" fill="#8D6E63"/>
          <ellipse cx="72" cy="200" rx="13" ry="7" fill="#8D6E63"/>
        </>
      )}
      {pies?.id === "descalzo" && (
        <>
          <ellipse cx="48" cy="200" rx="12" ry="7" fill={piel}/>
          <ellipse cx="72" cy="200" rx="12" ry="7" fill={piel}/>
          {[0,1,2,3,4].map(i => (
            <circle key={`l${i}`} cx={38 + i*4} cy={196} r={2} fill={pielOscura}/>
          ))}
          {[0,1,2,3,4].map(i => (
            <circle key={`r${i}`} cx={62 + i*4} cy={196} r={2} fill={pielOscura}/>
          ))}
        </>
      )}

      {/* (Shorts integrados en el bloque de camiseta_costa) */}

      {/* Pantalones cuando usa poncho: cubren parte superior de piernas */}
      {cuerpo?.id === "poncho_sierra" && (
        <g>
          <rect x="40" y="165" width="16" height="33" rx="5" fill="#3E2723"/>
          <rect x="64" y="165" width="16" height="33" rx="5" fill="#3E2723"/>
        </g>
      )}

      {/* Cuello */}
      <rect x="50" y="90" width="20" height="16" rx="4" fill={piel}/>

      {/* Cabeza */}
      <ellipse cx="60" cy="68" rx="30" ry="28" fill={piel}/>

      {/* Pelo */}
      <ellipse cx="60" cy="42" rx="28" ry="14" fill={pielOscura}/>
      <rect x="32" y="42" width="9" height="20" rx="4" fill={pielOscura}/>
      <rect x="79" y="42" width="9" height="20" rx="4" fill={pielOscura}/>

      {/* Sombrero de paja */}
      {cabeza?.id === "sombrero_paja" && (
        <g>
          <ellipse cx="60" cy="44" rx="38" ry="7" fill="#F0C040"/>
          <rect x="38" y="20" width="44" height="26" rx="8" fill="#D4A017"/>
          <ellipse cx="60" cy="20" rx="22" ry="5" fill="#BF8A00"/>
          <line x1="38" y1="32" x2="82" y2="32" stroke="#BF8A00" strokeWidth="1.5"/>
        </g>
      )}
      {cabeza?.id === "chullo" && (
        <g>
          <rect x="33" y="28" width="54" height="35" rx="10" fill="#E53935"/>
          <ellipse cx="60" cy="28" rx="27" ry="10" fill="#C62828"/>
          <polygon points="60,5 50,28 70,28" fill="#E53935"/>
          <circle cx="60" cy="5" r="5" fill="white"/>
          <line x1="35" y1="42" x2="85" y2="42" stroke="#FFD600" strokeWidth="3"/>
          <rect x="22" y="40" width="14" height="22" rx="5" fill="#E53935"/>
          <rect x="84" y="40" width="14" height="22" rx="5" fill="#E53935"/>
        </g>
      )}
      {cabeza?.id === "corona_plumas" && (
        <g>
          {[-20,-10,0,10,20].map((offset, i) => (
            <ellipse
              key={i}
              cx={60 + offset}
              cy={30 - Math.abs(offset) * 0.3}
              rx="5"
              ry="18"
              fill={["#E53935","#FF9800","#4CAF50","#2196F3","#9C27B0"][i]}
              transform={`rotate(${offset * 0.8}, ${60 + offset}, 50)`}
            />
          ))}
          <rect x="38" y="46" width="44" height="12" rx="4" fill="#FFD600"/>
          <line x1="40" y1="52" x2="80" y2="52" stroke="#FF6B35" strokeWidth="2"/>
        </g>
      )}

      {/* Orejas */}
      <ellipse cx="31" cy="68" rx="7" ry="9" fill={piel}/>
      <ellipse cx="89" cy="68" rx="7" ry="9" fill={piel}/>

      {/* Ojos */}
      <ellipse cx="50" cy="65" rx="9" ry="10" fill="white"/>
      <ellipse cx="70" cy="65" rx="9" ry="10" fill="white"/>
      <circle cx="51" cy="66" r="5" fill="#3E2723"/>
      <circle cx="71" cy="66" r="5" fill="#3E2723"/>
      <circle cx="53" cy="64" r="2" fill="white"/>
      <circle cx="73" cy="64" r="2" fill="white"/>

      {/* Lentes */}
      {accCara?.id === "lentes" && (
        <g>
          <circle cx="50" cy="65" r="11" fill="none" stroke="#1565C0" strokeWidth="2.5"/>
          <circle cx="70" cy="65" r="11" fill="none" stroke="#1565C0" strokeWidth="2.5"/>
          <line x1="61" y1="65" x2="59" y2="65" stroke="#1565C0" strokeWidth="2"/>
          <line x1="28" y1="65" x2="39" y2="65" stroke="#1565C0" strokeWidth="2"/>
          <line x1="81" y1="65" x2="90" y2="65" stroke="#1565C0" strokeWidth="2"/>
          <circle cx="50" cy="65" r="9" fill="#1565C0" opacity="0.1"/>
          <circle cx="70" cy="65" r="9" fill="#1565C0" opacity="0.1"/>
        </g>
      )}

      {/* Audífonos */}
      {accCara?.id === "audifonos" && (
        <g>
          <path d="M 28 55 Q 20 68 28 82" fill="none" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <path d="M 92 55 Q 100 68 92 82" fill="none" stroke="#FF6B35" strokeWidth="5" strokeLinecap="round"/>
          <path d="M 28 55 Q 60 25 92 55" fill="none" stroke="#FF6B35" strokeWidth="3"/>
          <circle cx="25" cy="68" r="7" fill="#E64A19"/>
          <circle cx="95" cy="68" r="7" fill="#E64A19"/>
        </g>
      )}

      {/* Nariz */}
      <ellipse cx="60" cy="74" rx="5" ry="4" fill={pielOscura}/>

      {/* Boca */}
      <path d="M 48 83 Q 60 93 72 83" fill="none" stroke={pielOscura} strokeWidth="2.5" strokeLinecap="round"/>

      {/* Mejillas */}
      <ellipse cx="40" cy="78" rx="8" ry="5" fill="#FFB3BA" opacity="0.5"/>
      <ellipse cx="80" cy="78" rx="8" ry="5" fill="#FFB3BA" opacity="0.5"/>
    </svg>
  );
}