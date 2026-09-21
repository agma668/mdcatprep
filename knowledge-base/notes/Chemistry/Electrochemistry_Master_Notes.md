# Master Notes: 12. Electrochemistry

> **Study Directive:** The Entrance Test heavily targets **Faraday's Laws calculations** (converting Amps/Time into Mass deposited) and predicting cell spontaneity using the **Electrochemical Series**. Memorize the sign conventions for Anode/Cathode in both Galvanic and Electrolytic cells.

---

## 12.1 Oxidation - Reduction Concept

### 12.1.1 Define the Core Terms
- **a. Oxidation:** The **loss** of electrons, gain of oxygen, loss of hydrogen, or an **increase** in oxidation number.
- **b. Reduction:** The **gain** of electrons, loss of oxygen, gain of hydrogen, or a **decrease** in oxidation number.
- **c. Oxidation Number (O.N.):** The apparent or hypothetical electrical charge an atom would have if all its bonds were completely ionic.
- **d. Reducing Agent:** The substance that donates electrons (it forces another substance to be reduced). The reducing agent itself gets **oxidized**.
- **e. Oxidising Agent:** The substance that accepts electrons (it forces another substance to be oxidized). The oxidising agent itself gets **reduced**.

### 12.1.2 Determine Oxidation Number
*Critical Rules for Assigning O.N.:*
1. **Free Elements:** Always $0$ (e.g., $Na, O_2, P_4, S_8$).
2. **Group 1 & 2 Metals:** Always $+1$ and $+2$ in compounds, respectively.
3. **Hydrogen:** Usually $+1$ (Except in metal hydrides like $NaH$ where it is $-1$).
4. **Oxygen:** Usually $-2$ (Except in peroxides like $H_2O_2$ where it is $-1$, and in $OF_2$ where it is $+2$).
5. **Halogens:** Usually $-1$ (Except when bonded to Oxygen, e.g., in $ClO_3^-$, $Cl$ is $+5$).
6. **Molecules & Ions:** The sum of all O.N.s in a neutral molecule equals $0$. The sum in a polyatomic ion equals the overall charge of the ion.

### 12.1.3 / 12.1.4 / 12.1.5 / 12.1.6 Balancing Redox Equations
- **Half-Reaction (Ion-Electron) Method (for Acidic Medium):**
 1. Split the overall reaction into an Oxidation half and a Reduction half.
 2. Balance all atoms *except* $H$ and $O$.
 3. Balance $O$ atoms by adding $H_2O$ molecules to the deficient side.
 4. Balance $H$ atoms by adding $H^+$ ions to the deficient side.
 5. Balance the electrical charge by adding electrons ($e^-$) to the more positive side.
 6. Multiply each half-reaction by integers so that the total number of electrons lost equals electrons gained.
 7. Add the two halves together and cancel terms.
 *(If in Basic Medium: Perform all acidic steps, then add $OH^-$ to BOTH sides to neutralize all $H^+$, turning them into $H_2O$, then cancel excess $H_2O$).*

### 12.1.7 / 12.1.8 Uses of Redox and Titrations
- **Daily Life Uses:** Combustion of fossil fuels, rusting/corrosion of iron, cellular respiration (glucose oxidation), photosynthesis, and all batteries.
- **Redox Titrations:** Potassium Permanganate ($KMnO_4$) and Potassium Dichromate ($K_2Cr_2O_7$) are powerful oxidizing agents used to determine the concentration of unknown reducing agents (like $Fe^{2+}$). $KMnO_4$ is self-indicating (turns from purple to colorless).

---

## 12.2 Electrode, Electrode Potential and Electrochemical Series

### 12.2.1 Define the Terms
- **a. Cathode:** The electrode where **REDUCTION** always occurs. 
 *(In a Galvanic cell, it is the Positive terminal. In an Electrolytic cell, it is the Negative terminal).*
- **b. Anode:** The electrode where **OXIDATION** always occurs. 
 *(In a Galvanic cell, it is the Negative terminal. In an Electrolytic cell, it is the Positive terminal).*
 - **Memory Trick:** **CRAO** (Cathode-Reduction, Anode-Oxidation) always holds true.
- **c. Electrode Potential ($E$):** The tendency of an electrode to either lose or gain electrons when placed in a solution of its own ions.
- **d. Standard Electrode Potential ($E^\circ$):** The potential measured under exact standard conditions: $1 \text{ M}$ concentration of ions, $1 \text{ atm}$ pressure for gases, and $298 \text{ K}$ ($25^\circ\text{C}$). IUPAC convention states $E^\circ$ values are normally reported as **Standard Reduction Potentials**.
- **e. Electrochemical Series:** A list of elements/half-reactions arranged in order of their Standard Reduction Potentials. 
 - *Top of table (Very Negative $E^\circ$):* Lithium/Potassium. Extremely strong **Reducing Agents** (they want to be oxidized).
 - *Bottom of table (Very Positive $E^\circ$):* Fluorine. Extremely strong **Oxidising Agents** (they aggressively want to be reduced).

### 12.2.2 Standard Hydrogen Electrode (SHE)
- Because you cannot measure the absolute potential of a single half-cell, all potentials are measured relative to the SHE.
- **Construction:** A piece of inert Platinum foil coated with Pt-black, immersed in a $1 \text{ M}$ solution of $H^+$ ions (e.g., $1 \text{ M } HCl$), with pure $H_2$ gas bubbled over it at exactly $1 \text{ atm}$ pressure and $298 \text{ K}$.
- **Potential:** The $E^\circ$ of the SHE is arbitrarily assigned an exact value of **$0.00 \text{ V}$**.

---

## 12.3 Types of Electrochemical Cells

### 12.3.1 & 12.3.2 Cell Potential ($E^\circ_{\text{cell}}$)
- **Cell Potential (EMF):** The potential difference between the cathode and anode. It is the driving force that pushes electrons through the external circuit.
- **Formula:** $\mathbf{E^\circ_{\text{cell}} = E^\circ_{\text{reduction (Cathode)}} - E^\circ_{\text{reduction (Anode)}}}$
- *Rule for Spontaneity:* If $E^\circ_{\text{cell}}$ is positive ($>0$), the reaction is spontaneous (Galvanic). If negative, it requires external power (Electrolytic).

### 12.3.3 Lead Storage Batteries (Car Battery)
A secondary (rechargeable) Galvanic cell.
- **Anode:** Spongy Lead ($Pb$).
- **Cathode:** Lead dioxide ($PbO_2$) packed on a metal grid.
- **Electrolyte:** Approx $30\%$ aqueous Sulfuric Acid ($H_2SO_4$, specific gravity $\sim 1.25$).
- **Discharge Reaction (Spontaneous):** 
 $Pb(s) + PbO_2(s) + 2H_2SO_4(aq) \rightarrow 2PbSO_4(s) + 2H_2O(l)$
 *(Note: Both the anode and cathode turn into insoluble white Lead(II) Sulfate during discharge, and the acid is consumed, dropping its density).*

### 12.3.4 Fuel Cells ($H_2-O_2$ Cell)
- A galvanic cell that converts the chemical energy of a **continuously supplied** fuel directly into electrical energy. They do not need to be recharged; they run as long as fuel is supplied.
- **Mechanism:** Hydrogen gas is fed to the Anode (where it is oxidized to $H^+$). Oxygen gas is fed to the Cathode (where it is reduced to $O^{2-}$). They combine to form pure water. Highly efficient and zero-emission (used in Apollo space missions).

---

## 12.4 Faraday's Law

### 12.4.1 Explain Faraday's First and Second Laws of Electrolysis
1. **Faraday's First Law:** The mass ($m$) of any substance deposited or liberated at an electrode during electrolysis is directly proportional to the total quantity of electrical charge ($Q$) passed through the electrolyte.
 - $$ \mathbf{m = Z \times Q} \quad \text{or} \quad \mathbf{m = Z \times I \times t} $$
 *(Where $I$ is current in Amperes, $t$ is time in seconds, and $Z$ is the Electrochemical Equivalent).*
2. **Faraday's Second Law:** If the exact same quantity of electricity is passed through different electrolyte solutions connected in series, the masses of the substances deposited at the respective electrodes are directly proportional to their **Chemical Equivalent Masses ($E_q$)**.
 - $$ \frac{m_1}{m_2} = \frac{E_{q1}}{E_{q2}} $$
 *(Where $E_q = \text{Molar Mass} / \text{Valency}$).*

### 12.4.2 & 12.4.3 Calculate Quantity of Charge and Mass Produced
This is a standard 4-step computational process:
1. **Find Charge ($Q$):** Multiply Current by Time in seconds. $\mathbf{Q = I \times t}$
2. **Convert to Moles of Electrons:** 1 Faraday ($1 \text{ F}$) = the charge of 1 mole of electrons = $\mathbf{96,500 \text{ Coulombs}}$.
 - Moles of $e^- = \frac{Q}{96500}$
3. **Find Moles of Metal:** Use the balanced half-reaction. 
 - Example: $Cu^{2+} + 2e^- \rightarrow Cu$. It takes 2 moles of electrons to produce 1 mole of solid Copper.
 - Moles of Cu = $\frac{\text{Moles of } e^-}{2}$
4. **Find Mass:** Multiply moles of metal by its Molar Mass.
 - $\text{Mass } (g) = \text{Moles of metal} \times \text{Molar Mass}$
