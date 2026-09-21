# Master Notes: 10. Solution and Colloids

> **Study Directive:** This chapter bridges physical and analytical chemistry. You must have a rigid grasp on Raoult's Law (and what causes positive vs negative deviations) and the formulas for Colligative Properties. The exam loves to test the calculation of Molar Mass using elevation of boiling point or depression of freezing point.

---

## 10.1 Colloid, Suspension and Solution

### 10.1.1 & 10.1.3 Properties and Characteristics (The Big Comparison)
To classify a mixture, you must look at particle size and optical properties.

| Property | True Solution | Colloid | Suspension |
| :--- | :--- | :--- | :--- |
| **Particle Size** | $< 1 \text{ nm}$ ($10^{-9} \text{ m}$) | $1 \text{ nm}$ to $1000 \text{ nm}$ | $> 1000 \text{ nm}$ |
| **Appearance** | Clear and Transparent | Translucent (appears homogeneous but isn't) | Opaque |
| **Settling** | Does not settle | Does not settle | Settles at the bottom due to gravity |
| **Filtration** | Passes through filter paper AND semi-permeable membranes | Passes through filter paper, but **NOT** semi-permeable membranes | Does not pass through either |
| **Tyndall Effect** | No (particles too small to scatter light) | **Yes** (scatters a beam of light) | Yes (until it settles) |

### 10.1.2 Types of Colloids
Colloids consist of a **dispersed phase** (solute-like) and a **dispersion medium** (solvent-like).
- **Aerosol:** Liquid or Solid dispersed in a **Gas** (e.g., Fog, Smoke, Hairspray).
- **Emulsion:** Liquid dispersed in a **Liquid** (e.g., Milk, Butter, Mayonnaise). *Often require an emulsifier to stay stable.*
- **Sol:** Solid dispersed in a **Liquid** (e.g., Paint, Ink, Cell cytoplasm).
- **Gel:** Liquid dispersed in a **Solid** (e.g., Jelly, Cheese, Gelatin).
- **Foam:** Gas dispersed in a **Liquid** (e.g., Whipped cream, Shaving cream).

### 10.1.4 Classify Given Substances
- *Solutions:* Saltwater, Sugar in water, Alloys (Brass).
- *Colloids:* Blood, Milk, Fog, Smoke.
- *Suspensions:* Muddy water, Sand in water, Chalk powder in water.

---

## 10.2 Concentration Units

### 10.2.1 Calculate the Concentration Units
1. **Percentage Composition:**
 - **% w/w:** (Mass of solute / Mass of solution) $\times 100$
 - **% w/v:** (Mass of solute in g / Volume of solution in mL) $\times 100$
 - **% v/v:** (Volume of solute / Volume of solution) $\times 100$
2. **Molarity ($M$):** Moles of solute per Liter ($dm^3$) of solution.
 - * Trap:* Molarity depends on volume, and volume changes with temperature. Therefore, **Molarity is temperature-dependent**.
3. **Molality ($m$):** Moles of solute per Kilogram ($kg$) of solvent.
 - * Trap:* Molality strictly uses mass. Mass does not change with temperature. Therefore, **Molality is temperature-independent** (which is why it is used in colligative property formulas).
4. **Mole Fraction ($X$):** Moles of component A / Total moles of all components. 
 - $X_A = \frac{n_A}{n_A + n_B}$. The sum of all mole fractions always equals 1 ($X_A + X_B = 1$). Temperature independent.
5. **Micro-concentrations:** Used for extremely dilute solutions (like pollutants in water).
 - **ppm:** (Mass of solute / Mass of solution) $\times 10^6$
 - **ppb:** (Mass of solute / Mass of solution) $\times 10^9$
 - **ppt:** (Mass of solute / Mass of solution) $\times 10^{12}$

---

## 10.3 General Properties of Solution and Solubility

### 10.3.1 Hydrophilic vs Hydrophobic Molecules
- **Hydrophilic ("Water-loving"):** Molecules that are polar or ionic. They form strong hydrogen bonds or ion-dipole interactions with water (e.g., $NaCl$, Glucose, Ethanol).
- **Hydrophobic ("Water-fearing"):** Molecules that are non-polar. They cannot form bonds with water and are pushed out of the water network (e.g., Oils, Fats, Hydrocarbons).
- *Rule of thumb:* "Like dissolves like."

### 10.3.2 Predict Nature of Solutions in Liquid Phase
1. **Completely Miscible:** Liquids mix in all proportions to form a single layer. (e.g., Ethanol and Water—due to mutual H-bonding).
2. **Immiscible:** Liquids do not mix at all and form two distinct layers. (e.g., Oil and Water, Benzene and Water).
3. **Partially Miscible:** Liquids mix only to a limited extent (e.g., Phenol and Water). They form two "conjugate solutions." If heated to their **Critical Solution Temperature** (for Phenol-water it is $65.9^\circ\text{C}$), they merge into one completely miscible layer.

### 10.3.3 Interpret Solubility Graphs
- **Continuous Solubility Curves:** Show a smooth, unbroken line as temperature changes.
 - *Upward slope:* Solubility increases with temp. Dissolution is **Endothermic** (e.g., $KNO_3, NaNO_3$).
 - *Downward slope:* Solubility decreases with temp. Dissolution is **Exothermic** (e.g., $Ce_2(SO_4)_3, Li_2CO_3$).
- **Discontinuous Solubility Curves:** Show sharp breaks/kinks in the curve. These breaks occur because the solid solute undergoes a phase change, usually losing its water of crystallization. 
 - *Classic Example:* $Na_2SO_4 \cdot 10H_2O$ (Glauber's salt) increases in solubility up to exactly **$32.4^\circ\text{C}$**. At this temp, it loses its water to become anhydrous $Na_2SO_4$, and its solubility suddenly begins to decrease.

---

## 10.4 Raoult's Law

### 10.4.1 State Raoult's Law (All Three Definitions)
For a solution containing a non-volatile solute:
1. The vapour pressure of the solvent above the solution is equal to the vapour pressure of the pure solvent multiplied by its mole fraction. $\implies P_A = P_A^\circ \cdot X_A$
2. The **lowering** of vapour pressure ($\Delta P$) is directly proportional to the mole fraction of the solute. $\implies \Delta P = P_A^\circ \cdot X_2$
3. The **relative lowering** of vapour pressure is equal to the mole fraction of the solute. $\implies \frac{\Delta P}{P_A^\circ} = X_2$

### 10.4.2 & 10.4.3 Ideal vs Non-Ideal Solutions using Graphs
If two **volatile** liquids (A and B) are mixed: $P_{total} = P_A + P_B = (P_A^\circ \cdot X_A) + (P_B^\circ \cdot X_B)$.

1. **Ideal Solutions:** 
 - Perfectly obey Raoult's Law at all concentrations and temps.
 - Intermolecular forces A-A and B-B are exactly equal to A-B.
 - $\Delta H_{mixing} = 0$ (no heat released/absorbed) and $\Delta V_{mixing} = 0$.
 - *Example:* Benzene + Toluene. The graph shows a perfectly straight line connecting $P_A^\circ$ and $P_B^\circ$.
2. **Non-Ideal (Positive Deviation):** 
 - Vapour pressure is **higher** than expected by Raoult's law.
 - A-B attractive forces are **weaker** than A-A or B-B, making it easier for molecules to escape into the vapor phase.
 - $\Delta H_{mixing} > 0$ (Endothermic). Forms a minimum boiling azeotrope.
 - *Example:* Ethanol + Water.
3. **Non-Ideal (Negative Deviation):** 
 - Vapour pressure is **lower** than expected by Raoult's law.
 - A-B attractive forces are **stronger** than A-A or B-B. The molecules lock each other in the liquid phase.
 - $\Delta H_{mixing} < 0$ (Exothermic). Forms a maximum boiling azeotrope.
 - *Example:* Chloroform + Acetone (they form a new Hydrogen bond between each other).

---

## 10.5 Colligative Properties

### 10.5.1 Define the term 'Colligative Properties'
- Physical properties of dilute solutions that depend **exclusively on the total number of solute particles** (ions or molecules) present, and are completely independent of the chemical identity or nature of the solute.
- *(Note: A 1M solution of Glucose yields 1M of particles. A 1M solution of $NaCl$ yields 2M of particles ($Na^+, Cl^-$). Therefore, $NaCl$ has twice the colligative effect!).*

### 10.5.2 Explain the Colligative Properties
1. **Lowering of Vapour Pressure:** When a non-volatile solute is added, its particles occupy space on the liquid's surface. This physically blocks solvent molecules from escaping, thus lowering the vapour pressure.
2. **Elevation of Boiling Point (Ebullioscopy):** Because the vapour pressure is lowered, the solution must be heated to a *higher temperature* to make its vapour pressure equal to the external atmospheric pressure. 
 - $\Delta T_b = K_b \cdot m$ *(where $K_b$ is the ebullioscopic constant and $m$ is molality).*
3. **Depression of Freezing Point (Cryoscopy):** Solute particles get in the way and disrupt the solvent molecules from arranging themselves into a solid lattice. Thus, a *lower temperature* is required to freeze the solution.
 - $\Delta T_f = K_f \cdot m$ *(where $K_f$ is the cryoscopic constant).*
4. **Osmotic Pressure ($\pi$):** The exact external hydrostatic pressure that must be applied to the solution side to completely stop the spontaneous flow of pure solvent across a semi-permeable membrane.
 - $\pi = CRT$ *(where C is molarity, R is gas constant, T is Kelvin).*

### 10.5.3 Calculate Molar Mass using Ebullioscopic and Cryoscopic Methods
By expanding the molality ($m$) term: $m = \frac{\text{mass of solute } (W_2) \times 1000}{\text{Molar Mass of solute } (M_2) \times \text{mass of solvent } (W_1)}$.

Substituting this into the elevation of boiling point equation:
$$ \Delta T_b = \frac{K_b \times W_2 \times 1000}{M_2 \times W_1} $$

Rearranging to solve for the **Molar Mass of the unknown solute ($M_2$)**:
$$ \mathbf{M_2 = \frac{1000 \times K_b \times W_2}{\Delta T_b \times W_1}} $$

*(The exact same algebraic structure applies for freezing point depression, just substitute $\Delta T_f$ and $K_f$).*
