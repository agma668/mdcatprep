# Master Notes: 11. Thermochemistry

> **Study Directive:** The Entrance Test frequently tests the strict difference between **State Functions** and **Path Functions**, and the sign conventions of the First Law of Thermodynamics ($\Delta E = q + w$). You must also clearly distinguish what a Glass Calorimeter measures ($q_p = \Delta H$) versus a Bomb Calorimeter ($q_v = \Delta E$).

---

## 11.1 Thermodynamics

### 11.1.1 Define 'Thermodynamics'
- The branch of physical chemistry that deals with the quantitative relationships between heat and other forms of energy (like mechanical work), and the physical/chemical changes that cause energy transfers.

### 11.1.2 Define the Core Terms
- **a. System:** The specific macroscopic part of the universe under observation or experimental study (e.g., the chemicals inside a beaker).
- **b. Surrounding:** Absolutely everything else in the universe that exists outside the system. The system and surroundings are separated by a **boundary** (which can be real or imaginary, rigid or movable).
- **c. State Function:** A macroscopic property of a system whose value depends **exclusively on the current initial or final state** of the system, and is completely **independent of the path** or mechanism taken to reach that state.
 - *Examples:* Enthalpy ($H$), Internal Energy ($E$), Pressure ($P$), Volume ($V$), Temperature ($T$).
 - * Trap:* **Heat ($q$) and Work ($w$) are NOT state functions.** They are path functions.
- **d. Heat ($q$):** The transfer of thermal energy across a system boundary strictly due to a temperature difference between the system and surroundings.
- **e. Internal Energy ($E$ or $U$):** The total sum of all possible kinds of kinetic energy (translational, rotational, vibrational) and potential energy (bonding forces, IMFs) of all the particles contained within the system. We cannot measure absolute $E$, only the change ($\Delta E$).
- **f. Work ($w$):** In chemistry, work is usually **Pressure-Volume (P-V) work** associated with the expansion or compression of gases against an external pressure. ($w = -P\Delta V$).
- **g. Enthalpy ($H$):** The total heat content of a system evaluated at constant pressure. Mathematically defined as $H = E + PV$.

---

## 11.2 First Law of Thermodynamics

### 11.2.1 Explain the First Law (with Daily Life Examples)
- **Statement:** The Law of Conservation of Energy. Energy can neither be created nor destroyed, but it can be transferred from one object to another or transformed from one form into another. The total energy of the universe is constant.
- **Examples:** 
 - A car engine (chemical energy of petrol $\to$ heat energy $\to$ mechanical kinetic energy). 
 - A light bulb (electrical energy $\to$ light and heat energy).

### 11.2.2 Relate $\Delta E$ with Thermal Energy at Constant Volume and Pressure
The mathematical statement of the First Law is: **$\Delta E = q + w$**
*(Where $w = -P\Delta V$ for expanding gases)*. Therefore: $\Delta E = q - P\Delta V$

1. **At Constant Volume ($\Delta V = 0$):**
 - If a reaction occurs in a sealed, rigid container (like a bomb calorimeter), the volume cannot change. Therefore, work done ($P\Delta V$) = 0.
 - $\Delta E = q_v - 0 \implies \mathbf{\Delta E = q_v}$
 - *Conclusion:* Heat supplied at constant volume is entirely used to increase the internal energy of the system.
2. **At Constant Pressure:**
 - Most lab reactions occur in open beakers under constant atmospheric pressure. The system can expand and do work.
 - $\Delta E = q_p - P\Delta V \implies q_p = \Delta E + P\Delta V$
 - By definition, Enthalpy change ($\Delta H$) is $\Delta E + P\Delta V$. Therefore: $\mathbf{q_p = \Delta H}$
 - *Conclusion:* Heat supplied at constant pressure exactly equals the change in enthalpy.

### 11.2.3 Calculate Internal Energy and Work Done
*Sign Conventions are critical here!*
- **$q$ is positive (+):** Heat is absorbed BY the system (Endothermic).
- **$q$ is negative (-):** Heat is released BY the system (Exothermic).
- **$w$ is positive (+):** Work is done **ON** the system by the surroundings (Compression, volume decreases).
- **$w$ is negative (-):** Work is done **BY** the system on the surroundings (Expansion, volume increases).

---

## 11.3 Hess's Law

### 11.3.1 Explain Hess's Law of Heat Summation
- **Statement:** The total enthalpy change ($\Delta H$) for a chemical reaction is absolutely identical regardless of whether the reaction takes place in a single step or in a series of multiple intermediate steps. 
- *Why?* Because Enthalpy is a **State Function**.

### 11.3.2 & 11.3.3 Construct Energy Cycles and Calculate Enthalpy
- Hess's law allows us to calculate the $\Delta H$ of reactions that are too dangerous, too slow, or impossible to measure directly in a lab.
- **The Formula:** $\Delta H_{reaction} = \sum \Delta H_{f (\text{Products})} - \sum \Delta H_{f (\text{Reactants})}$
 *(Where $\Delta H_f$ is the Standard Enthalpy of Formation. Note: The $\Delta H_f$ of any element in its standard state, like $O_2(g)$ or $C(graphite)$, is exactly zero).*

---

## 11.4 Measurement of Enthalpy of a Reaction

### 11.4.1 Explain Working of a Calorimeter
A calorimeter is heavily insulated to prevent heat exchange with the surroundings.
1. **Glass Calorimeter (Coffee-Cup Calorimeter):**
 - Operates open to the atmosphere. Therefore, it measures heat at **Constant Pressure ($q_p$)**.
 - Because $q_p = \Delta H$, this device directly measures the **Change in Enthalpy ($\Delta H$)**.
 - *Use:* Ideal for measuring heats of neutralization or dissolution.
2. **Bomb Calorimeter:**
 - A heavy steel "bomb" containing the sample is submerged in a water bath. The steel bomb cannot expand. Therefore, it measures heat at **Constant Volume ($q_v$)**.
 - Because $q_v = \Delta E$, this device directly measures the **Change in Internal Energy ($\Delta E$)**.
 - *Use:* Ideal for explosive or combustion reactions.

### 11.4.2 Calculate Heat of Reaction from Experimental Data
The heat absorbed or released by the water/calorimeter is calculated using:
$$ \mathbf{q = m \cdot c \cdot \Delta T} $$
- $m$ = mass of water (or solution)
- $c$ = specific heat capacity ($4.18 \text{ J/g}^\circ\text{C}$ for water)
- $\Delta T$ = Change in temperature ($T_{final} - T_{initial}$)
*(If the entire heat capacity of the calorimeter $C_{cal}$ is given instead of water's mass/specific heat, the formula simplifies to: $q = C_{cal} \cdot \Delta T$).*

---

## 11.5 Born-Haber Cycle

### 11.5.1 Define Born-Haber's Cycle
- A specific, specialized application of Hess's Law used to analyze the energetic steps in the formation of an ionic crystal lattice. It is primarily used to calculate the **Lattice Energy** of ionic compounds, which cannot be measured directly.

### 11.5.2 Explain Reaction Pathway Diagram (e.g., for $NaCl$)
The cycle breaks down the direct formation of $NaCl(s)$ from $Na(s)$ and $\frac{1}{2} Cl_2(g)$ into five hypothetical steps:
1. **Atomization/Sublimation of Metal:** $Na(s) \to Na(g)$ [Endothermic, $\Delta H_{sub}$]
2. **Ionization of Metal:** $Na(g) \to Na^+(g) + e^-$ [Endothermic, $IE$]
3. **Dissociation of Non-metal:** $\frac{1}{2} Cl_2(g) \to Cl(g)$ [Endothermic, $\Delta H_{diss}$]
4. **Electron Affinity of Non-metal:** $Cl(g) + e^- \to Cl^-(g)$ [Exothermic, $EA$]
5. **Lattice Energy:** $Na^+(g) + Cl^-(g) \to NaCl(s)$ [Highly Exothermic, $LE$]

### 11.5.3 Calculate Lattice Energy and Enthalpy of Formation
According to Hess's Law, the sum of the energies of the 5 individual steps must equal the direct Enthalpy of Formation ($\Delta H_f$):
$$ \mathbf{\Delta H_f = \Delta H_{sub} + IE + \frac{1}{2}\Delta H_{diss} + EA + LE} $$
You can rearrange this algebraically to solve for the missing Lattice Energy ($LE$).

---

## 11.6 Heat Capacity

### 11.6.1 Describe the terms:
- **a. Heat Capacity ($C$):** The total amount of heat energy required to raise the temperature of a specific *entire object or system* by exactly $1 \text{ K}$ (or $1^\circ\text{C}$). 
 - *Units:* $\text{J/K}$ or $\text{J/}^\circ\text{C}$. (Depends on the size of the object).
- **b. Specific Heat Capacity ($c$):** The amount of heat energy required to raise the temperature of exactly **1 gram** of a substance by $1 \text{ K}$.
 - *Units:* $\text{J} \cdot \text{g}^{-1} \cdot \text{K}^{-1}$. (This is an intensive property; it is unique to the material, regardless of sample size).
- **c. Molar Heat Capacity ($C_m$):** The amount of heat energy required to raise the temperature of exactly **1 mole** of a substance by $1 \text{ K}$.
 - *Units:* $\text{J} \cdot \text{mol}^{-1} \cdot \text{K}^{-1}$.
