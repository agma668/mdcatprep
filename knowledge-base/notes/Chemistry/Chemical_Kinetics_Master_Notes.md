# Master Notes: 9. Chemical Kinetics

> **Study Directive:** The Entrance Test heavily focuses on the **Method of Initial Rates** (deducing order from a table of experimental data) and interpreting **Potential Energy Diagrams** (identifying $\Delta H$, $E_a$, and the effect of a catalyst). Make sure you understand that the Rate Law is determined purely by experiment, never just by looking at the balanced chemical equation!

---

## 9.1 Chemical Kinetics

### 9.1.1 Define 'Chemical Kinetics'
- The branch of physical chemistry that deals with the study of the **speed (or rate)** of chemical reactions, the factors that affect this rate (like temperature, concentration, and catalysts), and the **mechanism** (the step-by-step pathway) by which the reaction proceeds from reactants to products.

---

## 9.2 Rate and Order of Reaction

### 9.2.1 Define the Core Terms
- **a. Rate of Reaction:** The change in concentration of a reactant or a product per unit of time. 
 - $\text{Rate} = -\frac{\Delta[\text{Reactants}]}{\Delta t} = +\frac{\Delta[\text{Products}]}{\Delta t}$
 - *Units:* $\text{mol} \cdot \text{dm}^{-3} \cdot \text{s}^{-1}$ (Molarity per second).
- **b. Rate Law:** An experimentally determined mathematical equation that links the rate of a reaction to the molar concentrations of its reactants.
 - $\text{Rate} = k[A]^x[B]^y$
- **c. Order of Reaction:** The sum of the power exponents to which the concentration terms are raised in the rate law equation.
 - Overall Order = $x + y$. 
 - Order determines how drastically the rate changes when concentration changes. It can be zero, an integer (1, 2, 3), or even a fraction.
- **d. Rate Constant ($k$):** The specific rate of reaction when the concentration of every reactant is exactly $1 \text{ M}$ ($1 \text{ mol/dm}^3$). 
 - * Trap:* The value of $k$ is entirely independent of concentration, but it is heavily **dependent on temperature** and the presence of a catalyst.
- **e. Rate Determining Step (RDS):** The strictly **slowest step** in a complex, multi-step reaction mechanism.

### 9.2.2 Significance of the Rate Determining Step
- A reaction is like a relay race; the overall speed can never be faster than the slowest runner. Therefore, the overall rate of a complex reaction is dictated entirely by the Rate Determining Step.
- **Crucial Rule:** The exponents in the Rate Law equation ($x, y$) match the stoichiometric coefficients of the reactants **only in the Rate Determining Step**, not the overall balanced equation.

### 9.2.3 / 9.2.4 Deduce the Order of Reaction using the Method of Initial Rate
This is an experimental method to find the order ($x, y$) and construct the rate law. You compare different experimental trials:
1. **Zero Order:** If doubling the concentration of $[A]$ has absolutely **no effect** on the rate, the reaction is zero-order with respect to A ($2^0 = 1$).
2. **First Order:** If doubling the concentration of $[A]$ exactly **doubles** the rate, it is first-order with respect to A ($2^1 = 2$).
3. **Second Order:** If doubling the concentration of $[A]$ **quadruples** the rate, it is second-order with respect to A ($2^2 = 4$).

---

## 9.3 Collision Theory, Transition State and Activation Energy

### 9.3.4 Describe Collision Theory
For a chemical reaction to occur, reactant particles must physically collide. However, not all collisions produce a reaction. An **"Effective Collision"** (one that yields products) requires two strict conditions:
1. **Activation Energy:** The colliding particles must possess a minimum amount of kinetic energy ($\ge E_a$) to break old bonds.
2. **Proper Orientation:** The molecules must collide in the correct spatial alignment to allow new bonds to form.

### 9.3.1 Relate Activation Energy and Activated Complex to Rate
- **Activation Energy ($E_a$):** The minimum extra amount of kinetic energy required by a colliding pair of molecules to initiate a chemical reaction.
 - *Relationship:* The higher the $E_a$, the fewer the molecules that have enough energy to react, resulting in a **slower** reaction rate.
- **Activated Complex (Transition State):** A highly unstable, short-lived, high-energy intermediate arrangement of atoms that exists exactly at the peak of the activation energy barrier. Old bonds are partially broken, and new bonds are partially formed.

### 9.3.3 Draw a Labelled Energy Diagram
Imagine a graph where the Y-axis is Potential Energy and the X-axis is Reaction Progress:
1. **Reactants** start at a specific energy level.
2. The curve goes up to a high peak. The height from the reactants to the peak is the **Activation Energy ($E_a$)**.
3. At the exact top of the peak sits the **Activated Complex**.
4. The curve drops down to the **Products**. 
5. The difference in energy between Reactants and Products is the Enthalpy Change (**$\Delta H$**).
6. **Effect of Catalyst:** A dotted line is drawn with a **lower peak**. The catalyst provides a new pathway with a lower $E_a$. Note that the energy of reactants, products, and $\Delta H$ remain completely unchanged.

### 9.3.5 Effect of Factors on Rate using Collision Theory
- **1. Concentration:** Increasing concentration means more particles in a given volume. This leads to a higher frequency of collisions, which increases the probability of effective collisions, increasing the rate.
- **2. Surface Area:** For solid reactants, crushing them into a powder drastically increases the exposed surface area. More particles are available for collisions simultaneously, increasing the rate.
- **3. Temperature:** *(Most dramatic effect)*. Increasing temperature increases the average kinetic energy of the molecules. 
 - Not only do they collide more frequently, but a **massively larger fraction** of the molecules now possess energy $\ge E_a$. 
 - *Rule of thumb:* A $10^\circ\text{C}$ rise in temperature usually doubles the reaction rate.

---

## 9.4 Catalysis

### 9.4.1 Define the term 'Catalyst'
- A substance that dramatically increases the rate of a chemical reaction without itself undergoing any permanent chemical or mass change by the end of the reaction.

### 9.4.2 Explain Homogeneous and Heterogeneous Catalysis
- **Homogeneous Catalysis:** The catalyst exists in the **exact same physical state (phase)** as the reactants.
 - *Example:* Both the catalyst ($NO(g)$) and the reactants ($SO_2(g), O_2(g)$) are gases in the lead chamber process.
- **Heterogeneous Catalysis:** The catalyst exists in a **different physical state** than the reactants. Usually, the catalyst is a solid transition metal providing a surface for gaseous or liquid reactants to adsorb onto.
 - *Example:* Solid Iron ($Fe(s)$) used to catalyze gaseous $N_2$ and $H_2$ in the Haber process.

### 9.4.3 Explain the Effect of Catalyst on the Rate of Reaction
- A catalyst **does not** give energy to the reactant molecules.
- Instead, it provides an entirely new, alternative reaction mechanism (pathway) that inherently has a **lower Activation Energy ($E_a$)**.
- Because the energy barrier is now lower, a vastly greater percentage of the reactant molecules already possess enough kinetic energy to overcome the barrier at the current temperature, causing the reaction rate to skyrocket.
- *Note:* It increases both the forward and reverse rates equally, so it brings the system to equilibrium faster without changing the final yield or $K_c$.
