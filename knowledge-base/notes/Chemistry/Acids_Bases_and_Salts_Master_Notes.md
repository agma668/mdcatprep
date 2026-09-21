# Master Notes: 8. Acids, Bases and Salts

> **Study Directive:** This chapter contains critical mathematical components (pH, $K_a$, Henderson's equation) alongside pure conceptual theories (Levelling effect, Hydrolysis vs Hydration). The exam often integrates these concepts, e.g., asking you to calculate the pH of a solution resulting from the *hydrolysis* of a specific salt. Pay very close attention to the formula $[H_3O^+] = \sqrt{K_a \times C}$.

---

## 8.1 Acids, Bases and Amphoteric Substances

### 8.1.1 Compare Arrhenius and Brønsted-Lowry Concepts
- **Arrhenius Concept:** 
 - *Acid:* A substance that yields Hydrogen ions ($H^+$) when dissolved in water (e.g., $HCl$).
 - *Base:* A substance that yields Hydroxide ions ($OH^-$) when dissolved in water (e.g., $NaOH$).
 - *Limitation:* Strictly limited to aqueous solutions and fails to explain basicity of compounds lacking $OH^-$ (like $NH_3$).
- **Brønsted-Lowry Concept:**
 - *Acid:* A substance that **donates a proton ($H^+$)** to another substance.
 - *Base:* A substance that **accepts a proton ($H^+$)** from another substance.
 - *Advantage:* Not restricted to aqueous solutions. Explains how $NH_3$ acts as a base by accepting $H^+$ from water to form $NH_4^+$.

### 8.1.2 Exemplify Amphoteric Compounds
- **Amphoteric Substance:** A substance that can act as either an acid or a base depending on the chemical environment.
- *Examples:* Water ($H_2O$), Ammonia ($NH_3$ can form $NH_4^+$ or $NH_2^-$), Bicarbonate ion ($HCO_3^-$), and Amino Acids (have both $-COOH$ and $-NH_2$ groups, forming zwitterions).

### 8.1.3 Significance of Acid-Base Reactions in Daily Life
1. **Food Preservation:** Bacteria and mold cannot survive in highly acidic environments. Acetic acid (vinegar) and citric acid are used to lower the pH of foods, pickling them and drastically extending their shelf life.
2. **Allergic Reactions (Stings):** A bee sting contains acidic toxins (formic acid). It is neutralized by rubbing a mild base like baking soda ($NaHCO_3$) on it. Conversely, a wasp sting is alkaline and is neutralized using vinegar.
3. **Gastric Acidity:** The stomach naturally produces $HCl$ (pH ~1.5) to digest food. Overproduction causes acid reflux/indigestion. It is neutralized using "antacids" which are mild bases like Magnesium Hydroxide ($Mg(OH)_2$, milk of magnesia) or Aluminum Hydroxide.
4. **Curdling of Milk:** Normal milk is slightly acidic. When left out, *Lactobacillus* bacteria convert lactose sugars into lactic acid. The sharp drop in pH denatures the milk protein (casein), causing it to coagulate and curdle.

### 8.1.4 Calculate Molarity, Molality and Strength
- **Molarity ($M$):** Moles of solute per Liter of *solution*. ($M = n / V$)
- **Molality ($m$):** Moles of solute per Kilogram of *solvent*. ($m = n / \text{mass}_{kg}$) — *Note: Molality is temperature independent, making it useful in thermodynamics.*
- **Acid-Base Titration Equation:** $\frac{M_1 V_1}{n_1} = \frac{M_2 V_2}{n_2}$ (where $n$ is the stoichiometric coefficient from the balanced equation).
- **Strength:** Usually expressed in grams per Liter ($g/L$). 
 $$ \text{Strength } (g/L) = \text{Molarity } (mol/L) \times \text{Molar Mass } (g/mol) $$

---

## 8.2 Conjugate Acids and Bases

### 8.2.1 Define 'Conjugate Acid' and 'Conjugate Base'
In any Brønsted-Lowry acid-base reaction: $\text{Acid}_1 + \text{Base}_2 \rightleftharpoons \text{Base}_1 + \text{Acid}_2$
- **Conjugate Base:** The species that remains immediately after an acid has donated its proton. (e.g., $Cl^-$ is the conjugate base of $HCl$).
- **Conjugate Acid:** The species formed immediately after a base has accepted a proton. (e.g., $H_3O^+$ is the conjugate acid of $H_2O$).

### 8.2.2 Compare the Strength of Conjugate Acids and Bases
- **Rule of Inverse Strength:** A strong acid yields a highly stable, exceptionally weak conjugate base. A weak acid yields a highly reactive, strong conjugate base.
 - *Example 1:* $HCl$ is a very strong acid. Therefore, $Cl^-$ is a negligible, extremely weak base.
 - *Example 2:* $CH_3COOH$ (acetic acid) is a weak acid. Therefore, the acetate ion ($CH_3COO^-$) is a relatively strong conjugate base (which is why its salts cause hydrolysis).

---

## 8.3 Strengths of Acids and Bases

### 8.3.1 Derive the Ionisation Constant of Water ($K_w$)
Water undergoes auto-ionization: $H_2O + H_2O \rightleftharpoons H_3O^+ + OH^-$
Equilibrium constant: $K_c = \frac{[H_3O^+][OH^-]}{[H_2O]^2}$
Since the concentration of water remains virtually constant ($\sim 55.5 \text{ M}$), it is multiplied by $K_c$ to form a new constant, $K_w$:
$$ K_w = K_c \times [H_2O]^2 = [H_3O^+][OH^-] $$
At $25^\circ\text{C}$, the experimentally determined value of $K_w$ is strictly **$1.0 \times 10^{-14}$**.

### 8.3.2 Calculate pH and pOH
- $pH = -\log[H^+]$
- $pOH = -\log[OH^-]$
- Because $K_w = [H^+][OH^-] = 10^{-14}$, taking the negative log of both sides yields the critical relationship: 
 $$ pH + pOH = 14 $$

### 8.3.3 Compare Strength using pH and pOH
- Lower pH values ($0-3$) indicate high $[H^+]$ concentrations, thus **strong acids**.
- Higher pH values ($11-14$) indicate extremely low $[H^+]$ and high $[OH^-]$, thus **strong bases**.
- Lower pOH = stronger base. Higher pOH = stronger acid.

### 8.3.4 / 8.3.5 Ionisation Constants ($K_a$ and $K_b$) and their Relationship
For a generic weak acid $HA$: $HA + H_2O \rightleftharpoons H_3O^+ + A^-$
$$ K_a = \frac{[H_3O^+][A^-]}{[HA]} $$
For its conjugate base $A^-$: $A^- + H_2O \rightleftharpoons HA + OH^-$
$$ K_b = \frac{[HA][OH^-]}{[A^-]} $$
**The Relationship:** If you multiply $K_a$ by $K_b$ for a conjugate acid-base pair, the terms cancel out:
$$ K_a \times K_b = [H_3O^+][OH^-] = \mathbf{K_w} $$
*(Taking the negative log gives: $pK_a + pK_b = 14$)*.

### 8.3.6 Calculate $[H_3O^+]$ using $K_a$ and Molar Concentration
For a weak acid of concentration $C$, ionizing to a small extent $x$:
$K_a = \frac{x \cdot x}{C - x}$. Assuming $x$ is incredibly small compared to $C$, $C - x \approx C$.
$$ K_a = \frac{x^2}{C} \implies x^2 = K_a \times C $$
Since $x = [H_3O^+]$, the master formula for weak acids is:
$$ \mathbf{[H_3O^+] = \sqrt{K_a \times C}} $$

### 8.3.7 Explain the 'Levelling Effect'
- **The Concept:** Water is an excellent proton acceptor (base). If you place multiple strong acids ($HCl, HNO_3, HClO_4$) into water, water forces all of them to ionize 100%. 
- They all form $H_3O^+$ quantitatively. Therefore, in water, they all appear to have the exact same acid strength (the strength of $H_3O^+$). Water has **levelled** their strengths.
- *How to fix it:* To determine which strong acid is *actually* the strongest, you must dissolve them in a non-aqueous solvent that is a much poorer proton acceptor (like glacial acetic acid). In acetic acid, $HClO_4$ will ionize more than $HNO_3$, proving $HClO_4$ is the intrinsically stronger acid.

---

## 8.4 Lewis Concept of Acids and Bases

### 8.4.1 / 8.4.2 Exemplify and Classify Lewis Acids and Bases
- **Lewis Acid:** An electron-pair **acceptor** (an electrophile). It must have an empty orbital.
 - *Examples:* Molecules with incomplete octets ($BF_3, AlCl_3$). Simple cations ($H^+, Ag^+, Fe^{3+}$). Molecules where the central atom has empty d-orbitals.
- **Lewis Base:** An electron-pair **donor** (a nucleophile). It must have at least one lone pair.
 - *Examples:* Neutral molecules with lone pairs ($NH_3, H_2O, R-OH$). Anions ($Cl^-, OH^-, CN^-$).
- *Reaction:* A Lewis acid-base reaction results in the formation of a **coordinate covalent (dative) bond**. (e.g., $NH_3$ donates its lone pair to the empty boron orbital in $BF_3$, forming an $H_3N \to BF_3$ adduct).

---

## 8.5 Buffer Solution

### 8.5.1 Define 'Buffer Solution'
A solution that strongly **resists changes in pH** upon the addition of small amounts of a strong acid or a strong base.

### 8.5.2 Importance of Buffers in Daily Life
- **Biological:** Human blood must be maintained strictly between **pH 7.35 - 7.45**. If it falls out of this range (acidosis or alkalosis), cellular enzymes denature and death occurs rapidly. Blood is buffered primarily by the Carbonic acid-Bicarbonate system ($H_2CO_3 / HCO_3^-$).
- **Industrial:** Many chemical manufacturing processes, drug formulations, and fermentation (brewing beer) require strict pH control to occur efficiently.

### 8.5.3 Preparation of Different Types of Buffer
1. **Acidic Buffer (pH < 7):** Formed by mixing a **Weak Acid** with its **Salt of a Strong Base**. 
 - *Example:* Acetic acid ($CH_3COOH$) + Sodium acetate ($CH_3COONa$).
2. **Basic Buffer (pH > 7):** Formed by mixing a **Weak Base** with its **Salt of a Strong Acid**.
 - *Example:* Ammonium hydroxide ($NH_4OH$) + Ammonium chloride ($NH_4Cl$).

### 8.5.4 Application of Buffers to Maintain pH (Chemical Equations)
Taking the Acidic Buffer ($CH_3COOH$ and $CH_3COO^-$ from the salt) as an example:
- **If strong acid ($H^+$) is added:** The conjugate base immediately neutralizes it.
 $CH_3COO^- + H^+ \rightarrow CH_3COOH$ *(The strong $H^+$ is converted into a weak, unionized acid, preventing a pH drop).*
- **If strong base ($OH^-$) is added:** The weak acid immediately neutralizes it.
 $CH_3COOH + OH^- \rightarrow CH_3COO^- + H_2O$ *(The strong $OH^-$ is converted into neutral water).*

### 8.5.5 Calculate the pH using Henderson's Equation
The exact pH of a buffer is calculated using the Henderson-Hasselbalch equations:
- **For Acidic Buffers:** 
 $$ pH = pK_a + \log\left(\frac{[\text{Salt}]}{[\text{Acid}]}\right) $$
- **For Basic Buffers:** 
 $$ pOH = pK_b + \log\left(\frac{[\text{Salt}]}{[\text{Base}]}\right) $$
 *(Remember to subtract pOH from 14 to find the final pH!)*

---

## 8.6 Hydrolysis and Hydration

### 8.6.1 Define the term 'Hydrolysis'
Hydrolysis is a chemical reaction in which the cation or anion (or both) of a dissolved salt reacts with water to split the $H-O-H$ bond, creating an excess of either $H^+$ or $OH^-$ ions. This disrupts the neutrality of water, turning the final solution acidic or basic.

### 8.6.2 Explain the Types of Salts on the Basis of Hydrolysis
*( High-Yield Rule: The "Strong" component of the parent acid/base dictates the final pH of the salt).*
1. **Salt of Strong Acid + Strong Base (e.g., $NaCl$):** 
 - Neither $Na^+$ nor $Cl^-$ reacts with water. 
 - **No Hydrolysis occurs.** Solution remains perfectly neutral (pH = 7).
2. **Salt of Strong Acid + Weak Base (e.g., $NH_4Cl$):**
 - The cation of the weak base ($NH_4^+$) reacts with water (Cationic Hydrolysis): $NH_4^+ + H_2O \rightleftharpoons NH_3 + H_3O^+$.
 - Excess $H_3O^+$ is produced. Solution is **Acidic (pH < 7)**.
3. **Salt of Weak Acid + Strong Base (e.g., $CH_3COONa$):**
 - The anion of the weak acid ($CH_3COO^-$) reacts with water (Anionic Hydrolysis): $CH_3COO^- + H_2O \rightleftharpoons CH_3COOH + OH^-$.
 - Excess $OH^-$ is produced. Solution is **Basic (pH > 7)**.
4. **Salt of Weak Acid + Weak Base (e.g., $CH_3COONH_4$):**
 - Both ions undergo hydrolysis. The final pH depends on which is numerically stronger ($K_a$ vs $K_b$).

### 8.6.3 Differentiate between Hydrolysis and Hydration
- **Hydration:** A purely **physical** process. When an ion (like $Na^+$) enters water, polar water molecules physically surround it due to ion-dipole electrostatic attractions. The $H-O-H$ bonds of the water molecule **are not broken**.
- **Hydrolysis:** A **chemical** process. The water molecule is chemically cleaved. The $O-H$ covalent bond is broken to donate an $H^+$ or $OH^-$ to the interacting ion, fundamentally changing the pH of the solution.
