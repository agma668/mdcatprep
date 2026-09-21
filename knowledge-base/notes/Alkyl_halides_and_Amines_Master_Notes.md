# Master Notes: 17. Alkyl Halides and Amines

> **Study Directive:** This chapter forms the absolute backbone of organic synthesis. The exam will specifically test your ability to differentiate between **$S_N1$ vs $S_N2$** and **$E1$ vs $E2$** mechanisms based on the degree of the alkyl halide ($1^\circ, 2^\circ, 3^\circ$). Furthermore, predicting the exact alcohol formed by a **Grignard Reagent** is a guaranteed High-Yield topic.

---

## 17.1 Alkyl Halides ($R-X$)

### 17.1.1 Nomenclature and Structure
- **IUPAC:** Haloalkane (e.g., 2-chloropropane).
- **Trivial:** Alkyl halide (e.g., Isopropyl chloride).
- **Classification:** 
 - **$1^\circ$ (Primary):** Halogen attached to a carbon bonded to only 1 other carbon.
 - **$2^\circ$ (Secondary):** Halogen attached to a carbon bonded to 2 other carbons.
 - **$3^\circ$ (Tertiary):** Halogen attached to a carbon bonded to 3 other carbons.

### 17.1.2 Reactivity Based on Bond Energy
- The reactivity of alkyl halides depends *entirely* on the strength of the $C-X$ bond, **NOT** the electronegativity of the halogen.
- **Bond Energy Order:** $C-F > C-Cl > C-Br > C-I$ (Because Iodine is massive, the orbital overlap is poor, making the bond very weak).
- **Reactivity Order:** $\mathbf{R-I > R-Br > R-Cl \gg R-F}$. (Alkyl iodides are the most reactive; alkyl fluorides are practically inert).

### 17.1.4 Preparation from Alcohols
Alcohols are the best starting material to synthesize alkyl halides.
1. **With $HX$ (Lucas Reagent):** $ROH + HCl \xrightarrow{ZnCl_2} RCl + H_2O$
2. **With Thionyl Chloride ($SOCl_2$):** $ROH + SOCl_2 \to RCl + SO_2\uparrow + HCl\uparrow$ 
 - *(Note: This is the strictly preferred industrial method because both byproducts are gases that escape, leaving pure $RCl$ behind).*
3. **With Phosphorus Halides:**
 - $3ROH + PCl_3 \to 3RCl + H_3PO_3$ (Phosphorous acid)
 - $ROH + PCl_5 \to RCl + POCl_3 + HCl$

---

## 17.2 Nucleophilic Substitution Reactions ($S_N$)

A nucleophile ($Nu^-$, nucleus-loving, electron pair donor) attacks the slightly positive carbon, kicking out the Leaving Group ($X^-$).

### 17.2.1 & 17.2.3 $S_N2$ vs $S_N1$ Mechanisms

#### $S_N2$ (Substitution Nucleophilic Bimolecular)
- **Kinetics:** Rate $= k[RX][Nu^-]$ (depends on both reactants).
- **Mechanism:** A single, concerted 1-step reaction. The nucleophile attacks the carbon from the exact opposite side (backside attack) of the leaving group. It passes through a highly unstable **Transition State** where carbon is partially bonded to 5 atoms.
- **Stereochemistry:** Results in **$100\%$ Inversion of Configuration** (Walden Inversion) — like an umbrella blowing inside out.
- **Substrate Preference:** $\mathbf{Methyl > 1^\circ > 2^\circ}$ (Tertiary absolutely cannot undergo $S_N2$ due to massive steric hindrance blocking the backside attack).

#### $S_N1$ (Substitution Nucleophilic Unimolecular)
- **Kinetics:** Rate $= k[RX]$ (depends strictly on the alkyl halide only).
- **Mechanism:** A 2-step reaction. 
 - **Step 1 (Slow/Rate-Determining):** The $C-X$ bond breaks heterolytically to form a planar **Carbocation** intermediate.
 - **Step 2 (Fast):** The nucleophile attacks the planar carbocation from either the top or bottom face.
- **Stereochemistry:** Results in a **Racemic Mixture** ($50\%$ inversion, $50\%$ retention of configuration) because attack from either side is equally likely.
- **Substrate Preference:** $\mathbf{3^\circ > 2^\circ > 1^\circ}$ (Because tertiary carbocations are the most stable).

### 17.2.2 Carbocation Stability
- **Order of Stability:** $\mathbf{3^\circ > 2^\circ > 1^\circ > Methyl^+}$
- **Reason:** Alkyl groups ($CH_3$) are electron-donating via the **Inductive Effect (+I)** and **Hyperconjugation**. A $3^\circ$ carbocation has three alkyl groups pumping electron density toward the positive carbon, heavily stabilizing the charge.

---

## 17.3 Elimination Reactions ($E1$ and $E2$)

Instead of replacing the halogen, a strong base removes a proton ($H^+$) from the adjacent ($\beta$) carbon, and the halogen leaves, forming a $\mathbf{C=C}$ **double bond** (Alkene).

### 17.3.1 & 17.3.2 $E2$ vs $E1$ Mechanisms
- **$E2$ Mechanism (Bimolecular):** 1-step concerted. Base removes $H^+$, double bond forms, leaving group departs—all simultaneously. Rate $= k[RX][Base]$. Strongly favored by $3^\circ$ and $2^\circ$ halides using strong bases.
- **$E1$ Mechanism (Unimolecular):** 2-step. Leaving group leaves first, forming a carbocation. Then, a base removes $H^+$ to form the double bond. Rate $= k[RX]$.

### 17.3.4 Substitution ($S_N$) vs Elimination ($E$)
These two reactions are always in competition. The exam will ask you to predict the major product based on the reagent used:
- **Aqueous KOH (dilute, lower temp):** Acts as a nucleophile ($OH^-$). Favors **Substitution ($S_N$)** to form Alcohols.
- **Alcoholic KOH (concentrated, high heat):** Acts as a very strong, bulky base ($RO^-$). Favors **Elimination ($E$)** to form Alkenes.

---

## 17.4 Organo-Metallic Compounds (Grignard Reagents)

### 17.4.1 Preparation and Reactivity
- **Preparation:** Alkyl halide reacts with Magnesium metal in **pure, absolutely dry ether**.
 $R-X + Mg \xrightarrow{\text{Dry Ether}} R-Mg-X$
 *(Note: Trace moisture will instantly destroy the Grignard reagent, turning it into an alkane).*
- **Reactivity:** The $C-Mg$ bond is highly polar. The Magnesium is electropositive, making the Carbon highly nucleophilic (it behaves like a $\mathbf{R^-}$ **Carbanion**).

### 17.4.2 Reactions of Grignard Reagents ($RMgX$)
*This is the most critical synthetic pathway to memorize:*
- **With Formaldehyde ($HCHO$):** Yields a **$1^\circ$ Alcohol**.
- **With any other Aldehyde ($RCHO$):** Yields a **$2^\circ$ Alcohol**.
- **With Ketones ($R-CO-R'$):** Yields a **$3^\circ$ Alcohol**.
- **With Esters:** Adds *twice*. First, it forms a Ketone (which cannot be isolated), then immediately adds a second Grignard to yield a **$3^\circ$ Alcohol** (with two identical R groups).
- **With Carbon Dioxide ($O=C=O$):** Yields a **Carboxylic Acid** ($R-COOH$).

---

## 17.5 Amines

### 17.5.3 Structure and Classification
Amines are derivatives of Ammonia ($NH_3$). Unlike alcohols, their degree ($1^\circ, 2^\circ, 3^\circ$) depends entirely on how many Carbon atoms are directly attached to the Nitrogen.
- **$1^\circ$ (Primary):** $R-NH_2$ (e.g., Methylamine).
- **$2^\circ$ (Secondary):** $R-NH-R'$ (e.g., Dimethylamine).
- **$3^\circ$ (Tertiary):** $R_3N$ (e.g., Trimethylamine. *Note: Cannot form H-bonds with itself because it lacks an N-H bond*).

### 17.5.4 Basicity of Amines
- Amines act as **Lewis Bases** because of the lone pair of electrons on the Nitrogen.
- **Aliphatic Amines vs Ammonia:** Alkyl groups are electron-donating (+I effect). They push electron density onto the Nitrogen, making the lone pair more available. Therefore, **Aliphatic Amines are STRONGER bases than $NH_3$**.
- **Aromatic Amines (Aniline) vs Ammonia:** The lone pair on the Nitrogen of Aniline delocalizes into the benzene ring via resonance. Because the lone pair is "busy" and unavailable to accept a proton, **Aniline is a MUCH WEAKER base than $NH_3$**.

### 17.5.5 Preparation of Amines
- **a. Alkylation of $NH_3$:** $NH_3 + R-X \to R-NH_2 + HX$. (Often over-alkylates to form a messy mixture of $1^\circ, 2^\circ, 3^\circ$ and quaternary salts).
- **b. Reduction of Nitriles ($R-C\equiv N$):** Reduced by $LiAlH_4$ or $H_2/Ni \to R-CH_2NH_2$.
- **c. Reduction of Nitro compounds ($R-NO_2$):** Reduced by $Sn/HCl$ or $Fe/HCl \to R-NH_2$. (This is the standard laboratory method for making Aniline from Nitrobenzene).
- **d. Reduction of Amides ($R-CONH_2$):** Reduced by strong $LiAlH_4 \to R-CH_2NH_2$.

### 17.5.6 & 17.5.7 Reactions of Amines
- **Reaction with Aldehydes/Ketones:** Primary amines react with carbonyl compounds to form **Imines** (also known as Schiff bases). 
 $R-NH_2 + O=CR_2 \to R-N=CR_2 + H_2O$
- **Preparation of Amides:** React an amine with an Acid Chloride or Acid Anhydride.
 $R-NH_2 + CH_3COCl \to CH_3CONHR + HCl$
- **Preparation of Diazonium Salts (The Ice-Cold Reaction):**
 Primary aromatic amines (Aniline) react with Nitrous acid (generated *in situ* from $NaNO_2 + HCl$) at strictly **$0-5^\circ\text{C}$**. 
 $C_6H_5NH_2 + NaNO_2 + 2HCl \xrightarrow{0-5^\circ\text{C}} C_6H_5N_2^+Cl^- + NaCl + 2H_2O$
 *(Benzene Diazonium Chloride is highly unstable at room temperature but serves as a massive synthetic crossroad to make phenol, halobenzenes, and azo dyes).*
