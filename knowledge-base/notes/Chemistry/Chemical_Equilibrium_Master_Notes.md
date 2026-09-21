# Master Notes: 7. Chemical Equilibrium

> **Study Directive:** This chapter is highly analytical. The Entrance Test frequently tests your ability to rapidly predict the direction of a reaction using $Q_c$ vs $K_c$, and predicting shifts using Le-Chatelier's principle (especially for industrial reactions like the Haber process). The mathematical relationship between solubility ($s$) and $K_{sp}$ ($s^2$, $4s^3$, $27s^4$) is also a massive high-yield target.

---

## 7.1 Reversible Reaction and Dynamic Equilibrium

### 7.1.1 Define the term 'Reversible Reaction'
- A chemical reaction that proceeds in both the forward and reverse directions under the same conditions.
- The products react to reform the original reactants. 
- These reactions never go to completion (100% yield is impossible in a closed system) and are denoted by a double arrow ($\rightleftharpoons$).

### 7.1.2 Define the term 'Dynamic Equilibrium'
- The state in a reversible chemical reaction where the **rate of the forward reaction exactly equals the rate of the reverse reaction**.
- **Macroscopic level:** All observable properties (concentration, color, pressure, density) become completely constant.
- **Microscopic level:** The system is "dynamic" because the reactions have not stopped; reactants are turning into products and products into reactants at perfectly equal speeds.

### 7.1.3 Determine Equilibrium Constant ($K_c$) Expression
For a general reversible reaction: $aA + bB \rightleftharpoons cC + dD$
The equilibrium constant in terms of molar concentration ($K_c$) is:
$$ K_c = \frac{[C]^c [D]^d}{[A]^a [B]^b} $$
- **Rule:** Pure solids ($s$) and pure liquids ($l$) are omitted from the $K_c$ expression because their concentrations remain constant throughout the reaction. Only gases ($g$) and aqueous species ($aq$) are included.

### 7.1.4 Equilibrium Constant Expressions in other terms
1. **Partial Pressure ($K_p$):** Used for gaseous reactions.
 $$ K_p = \frac{(P_C)^c \cdot (P_D)^d}{(P_A)^a \cdot (P_B)^b} $$
 ** High-Yield Equation:** $K_p = K_c(RT)^{\Delta n}$
 *(Where $\Delta n = \text{moles of gaseous products} - \text{moles of gaseous reactants}$).*
 - If $\Delta n = 0$, then $K_p = K_c$.
2. **Number of Moles ($K_n$):** 
 $$ K_n = \frac{(n_C)^c \cdot (n_D)^d}{(n_A)^a \cdot (n_B)^b} $$
3. **Mole Fraction ($K_x$):**
 $$ K_x = \frac{(X_C)^c \cdot (X_D)^d}{(X_A)^a \cdot (X_B)^b} $$

### 7.1.5 Determine expression for Reaction Quotient ($Q_c$)
- The reaction quotient ($Q_c$) has the exact same mathematical expression as $K_c$. 
- **The Difference:** $K_c$ uses concentrations strictly measured *at equilibrium*. $Q_c$ uses initial concentrations or concentrations measured at *any random moment* before equilibrium is reached.

### 7.1.6 Predict the Direction of a Reaction ($Q_c$ vs $K_c$)
By calculating $Q_c$ and comparing it to the known $K_c$, you can predict which way the reaction must shift to reach equilibrium:
- **If $Q_c < K_c$:** The ratio of products to reactants is too low. The reaction will shift **FORWARD** (to the right) to make more products.
- **If $Q_c > K_c$:** The ratio of products to reactants is too high. The reaction will shift **REVERSE** (to the left) to consume products.
- **If $Q_c = K_c$:** The system is already at equilibrium.

### 7.1.7 Predict the Extent of Chemical Reaction from $K_c$
- **Large $K_c$ ($>10^3$):** The numerator (products) is much larger than the denominator (reactants). The reaction goes almost to completion.
- **Small $K_c$ ($<10^{-3}$):** The denominator is much larger. The reaction barely proceeds in the forward direction.
- **Intermediate $K_c$ ($\sim 0.1$ to $10$):** Significant amounts of both reactants and products are present at equilibrium.

---

## 7.2 Le-Chatelier's Principle and its Application

### 7.2.1 State Le-Chatelier's Principle
- "If a dynamic equilibrium is subjected to a stress (a change in concentration, pressure, volume, or temperature), the system will shift its equilibrium position in a way that counteracts or relieves that stress."

### 7.2.2 Predict the Effect on Equilibrium State and Yield
This is frequently tested using the industrial **Haber Process** ($N_2(g) + 3H_2(g) \rightleftharpoons 2NH_3(g) \quad \Delta H = -92.4 \text{ kJ/mol}$).

1. **Concentration:** 
 - Adding a reactant (or removing a product) shifts the reaction **Forward**.
 - *Haber:* Constantly removing $NH_3$ as it is formed forces the reaction to keep producing more $NH_3$.
2. **Pressure & Volume:** (Only affects gases)
 - Increasing pressure (decreasing volume) shifts the equilibrium to the side with **fewer moles of gas**.
 - Decreasing pressure shifts it to the side with **more moles of gas**.
 - *Haber:* 4 moles of gas react to form 2 moles of gas. Therefore, applying **High Pressure** shifts the reaction forward, maximizing $NH_3$ yield.
 - *Note:* If $\Delta n = 0$ (e.g., $H_2 + I_2 \rightleftharpoons 2HI$), changing pressure has absolutely no effect.
3. **Temperature:** 
 - Changing temperature is the **ONLY** factor that changes the actual numerical value of the equilibrium constant ($K_c$).
 - For an **Exothermic** reaction ($\Delta H < 0$), treating heat as a product: Increasing temp shifts it **Reverse** (lowers $K_c$). Decreasing temp shifts it **Forward**.
 - For an **Endothermic** reaction ($\Delta H > 0$): Increasing temp shifts it **Forward** (increases $K_c$).
 - *Haber:* It is exothermic. Therefore, a **Low Temperature** maximizes yield. (However, a compromise temperature of $\sim 450^\circ\text{C}$ is used industrially so the reaction isn't kinetically too slow).
4. **Catalyst:** 
 - A catalyst lowers the activation energy for both the forward and reverse reactions equally. 
 - It allows the system to reach equilibrium **faster**, but it **does not shift** the position of equilibrium or change the final yield.

---

## 7.3 Solubility Product and Precipitation Reactions

### 7.3.1 Define the term 'Solubility Product' ($K_{sp}$)
- The equilibrium constant for a solid substance dissolving in an aqueous solution. It represents the product of the molar concentrations of the constituent ions, each raised to the power of its stoichiometric coefficient in the equilibrium equation.
- Applies only to **sparingly (slightly) soluble salts** in a saturated solution.

### 7.3.2 Distinguish between Solubility and Solubility Product
- **Solubility ($s$):** The maximum amount (in moles or grams) of solute that can dissolve in a specific volume of solvent at a specific temperature. (Units: $\text{mol/L}$ or $\text{g/dm}^3$). It can change if a common ion is added.
- **Solubility Product ($K_{sp}$):** An equilibrium constant. Its value strictly depends on temperature and is utterly unaffected by the presence of other ions (like a common ion).

### 7.3.3 Explain Reasons for Difference in Solubility
Whether a salt dissolves depends on the battle between two energies:
1. **Lattice Energy:** The energy holding the solid crystal together (resists dissolving).
2. **Hydration Energy:** The energy released when water molecules surround and bond to the free ions (promotes dissolving).
- **Rule:** If Hydration Energy $>$ Lattice Energy, the substance is highly soluble. If Lattice Energy $>$ Hydration Energy, the substance is slightly soluble or insoluble.

### 7.3.4 Calculate $K_{sp}$ from the Solubility of Compounds
*This is a massive computational target.* Let $s$ be the molar solubility in $\text{mol/L}$.
1. **$AB$ type salts (e.g., $AgCl$, $BaSO_4$):**
 $AgCl \rightleftharpoons Ag^+ + Cl^-$
 $[Ag^+] = s$, $[Cl^-] = s \implies K_{sp} = (s)(s) = \mathbf{s^2}$
2. **$AB_2$ or $A_2B$ type salts (e.g., $CaF_2$, $PbCl_2$, $Ag_2S$):**
 $CaF_2 \rightleftharpoons Ca^{2+} + 2F^-$
 $[Ca^{2+}] = s$, $[F^-] = 2s \implies K_{sp} = (s)(2s)^2 = \mathbf{4s^3}$
3. **$AB_3$ or $A_3B$ type salts (e.g., $Al(OH)_3$, $FeCl_3$):**
 $Al(OH)_3 \rightleftharpoons Al^{3+} + 3OH^-$
 $[Al^{3+}] = s$, $[OH^-] = 3s \implies K_{sp} = (s)(3s)^3 = \mathbf{27s^4}$

### 7.3.5 Predict Precipitation (The Ion Product $Q_{sp}$)
To determine if a precipitate will form when two solutions are mixed, calculate the Ionic Product ($Q_{sp}$) using initial concentrations.
- **$Q_{sp} < K_{sp}$:** Solution is unsaturated. No precipitate forms. More solid can dissolve.
- **$Q_{sp} = K_{sp}$:** Solution is exactly saturated.
- **$Q_{sp} > K_{sp}$:** Solution is supersaturated. **Precipitation occurs** until $Q_{sp}$ drops to equal $K_{sp}$.

---

## 7.4 Common Ion Effect

### 7.4.1 Define the term 'Common Ion Effect'
- The shift in an ionic equilibrium caused by the addition of a solute that provides an ion that takes part in the equilibrium.
- Simply put: It is the suppression of the ionization of a weak electrolyte (or the reduction in solubility of a sparingly soluble salt) upon the addition of a strong electrolyte containing a **common ion**.
- It is a direct manifestation of Le-Chatelier's Principle.

### 7.4.2 Discuss Common Ion Effect and its Application
When a common ion is added, the product concentration increases, shifting the equilibrium to the **left**, causing the weak electrolyte to become unionized or the salt to precipitate.

**Major Applications:**
1. **Purification of Table Salt ($NaCl$):** 
 - $NaCl(s) \rightleftharpoons Na^+(aq) + Cl^-(aq)$
 - Hydrogen chloride gas ($HCl$) is passed through a saturated $NaCl$ solution. $HCl$ provides a massive excess of the common ion $Cl^-$.
 - This spikes the $[Cl^-]$ concentration, making $Q_{sp} > K_{sp}$. The equilibrium shifts left, and pure $NaCl$ precipitates out, leaving impurities dissolved in the water.
2. **Qualitative Salt Analysis (Group II and Group IV cations):**
 - **Group II:** We want to precipitate basic radicals like $Cu^{2+}$ and $Pb^{2+}$ as sulfides using $H_2S$ gas. However, their $K_{sp}$ values are very low. To prevent Group IV sulfides (which have higher $K_{sp}$) from precipitating at the same time, $HCl$ is added. The common $H^+$ ion from $HCl$ strongly suppresses the ionization of the weak acid $H_2S$. This keeps the sulfide ion $[S^{2-}]$ concentration incredibly low—just enough to precipitate Group II, but not Group IV.
3. **Buffer Solutions:** Buffers resist pH changes because they are mixtures of a weak acid and its conjugate base salt, which rely entirely on the common ion effect to suppress complete ionization.
