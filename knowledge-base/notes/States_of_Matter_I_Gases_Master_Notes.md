# Master Notes: 4. States of Matter I: Gases

> **Study Directive:** This chapter is mathematically heavy and heavily tested in the entry test. Pay extreme attention to the different units and values of the Universal Gas Constant ($R$) and the exact conditions that cause deviations from ideal behavior.

---

## 4.1 Kinetic Molecular Theory of Gases

### 4.1.1 Describe the Kinetic Molecular Theory (KMT) of Gases
The KMT (developed by Maxwell, Boltzmann, and Clausius) provides a microscopic model to explain the macroscopic properties of gases.
**Key Postulates:**
1. A gas consists of a very large number of tiny particles (molecules or atoms).
2. These particles are in constant, random, straight-line motion, colliding with each other and the walls of the container.
3. The collisions are **perfectly elastic** (no net loss of kinetic energy).
4. The actual volume occupied by the gas molecules themselves is **negligible** compared to the total volume of the container.
5. There are **no intermolecular forces of attraction or repulsion** between ideal gas molecules.
6. The average kinetic energy of the gas particles is **directly proportional to the absolute temperature (Kelvin)**.

### 4.1.2 Explain the Gas Laws
**a. Boyle's Law:** At a constant temperature ($T$) and number of moles ($n$), the volume ($V$) of a gas is inversely proportional to its pressure ($P$).
$$ V \propto \frac{1}{P} \implies P_1V_1 = P_2V_2 $$

**b. Charles's Law:** At a constant pressure ($P$) and number of moles ($n$), the volume ($V$) of a gas is directly proportional to its absolute temperature ($T$).
$$ V \propto T \implies \frac{V_1}{T_1} = \frac{V_2}{T_2} $$

**c. Avogadro's Law:** Equal volumes of all gases at the same temperature and pressure contain the same number of molecules (or moles, $n$).
$$ V \propto n $$

**d. Dalton's Law of Partial Pressure:** The total pressure of a mixture of non-reacting gases is equal to the sum of the partial pressures of the individual gases.
$$ P_{total} = P_1 + P_2 + P_3 + \dots $$
*(Partial pressure of gas A: $P_A = \text{mole fraction of A} \times P_{total}$)*

**e. Graham's Law of Diffusion/Effusion:** The rate of diffusion or effusion of a gas is inversely proportional to the square root of its density ($d$) or molar mass ($M$).
$$ \text{Rate} \propto \frac{1}{\sqrt{M}} \implies \frac{r_1}{r_2} = \sqrt{\frac{M_2}{M_1}} $$
*(Lighter gases diffuse faster. $H_2$ diffuses 4 times faster than $O_2$ because $\sqrt{32/2} = \sqrt{16} = 4$).*

### 4.1.3 Explain the Gas Laws with reference to KMT
- **Boyle's Law via KMT:** If volume is halved, the density of gas particles doubles. They hit the walls twice as frequently, thus doubling the pressure.
- **Charles's Law via KMT:** If temperature increases, kinetic energy increases. Particles hit the walls harder and more frequently. To maintain a constant pressure, the container volume must expand.
- **Dalton's Law via KMT:** Since gas particles act independently and have no intermolecular forces (KMT postulate 5), each gas in a mixture exerts pressure exactly as if it were alone in the container.

### 4.1.4 Relate Effect of Temperature to Average Kinetic Energy
According to KMT, temperature is simply a macroscopic measurement of microscopic kinetic energy.
$$ E_k \propto T \implies E_k = \frac{3}{2} kT \quad \text{or for one mole: } E_k = \frac{3}{2} RT $$
If the absolute temperature doubles (e.g., from 200 K to 400 K), the average kinetic energy of the gas particles exactly doubles.

---

## 4.2 Absolute Temperature Scale on the Basis of Charles's Law

### 4.2.1 Explain 'Absolute Zero' with reference to Charles's Law
If we plot Volume vs. Temperature (in Celsius) for any gas at constant pressure, the straight line extrapolated backward intercepts the x-axis (where Volume = 0) at exactly **$-273.15^\circ\text{C}$**.
- **Absolute Zero:** This theoretical lowest possible temperature where the volume of an ideal gas becomes zero. All molecular motion ceases. Lord Kelvin designated this as $0 \text{ K}$.

### 4.2.2 Convert Temperature into Different Scales
To succeed in calculations, you must seamlessly convert temperatures before using gas laws. (Gas laws ONLY work with Kelvin).
- **Celsius to Kelvin:** $K = C + 273.15$
- **Celsius to Fahrenheit:** $F = \left(\frac{9}{5} \times C\right) + 32$
- **Fahrenheit to Celsius:** $C = \frac{5}{9} \times (F - 32)$

---

## 4.3 Ideal Gas Equation

### 4.3.1 Derive Ideal Gas Equation
By combining the three fundamental gas laws:
- Boyle's Law: $V \propto \frac{1}{P}$
- Charles's Law: $V \propto T$
- Avogadro's Law: $V \propto n$
Combining them yields: $V \propto \frac{nT}{P}$
Introducing the universal gas constant ($R$): 
$$ PV = nRT $$

### 4.3.2 Calculate the Values of Ideal Gas Constant ($R$)
> ** High-Yield:** You must memorize these three specific values of $R$ corresponding to their units. Using the wrong $R$ value is the most common student error.

At standard conditions for 1 mole of an ideal gas ($P = 1 \text{ atm}, T = 273.15 \text{ K}, V = 22.414 \text{ dm}^3$):

**a. Pressure in atm, Volume in $\text{dm}^3$ (or Liters):**
$$ R = \frac{1 \text{ atm} \times 22.414 \text{ dm}^3}{1 \text{ mol} \times 273.15 \text{ K}} = \mathbf{0.0821 \text{ dm}^3\cdot\text{atm}\cdot\text{K}^{-1}\text{mol}^{-1}} $$

**b. Pressure in mm Hg (or torr), Volume in $\text{cm}^3$:**
(Substitute $1 \text{ atm} = 760 \text{ mmHg}$ and $22.414 \text{ dm}^3 = 22414 \text{ cm}^3$)
$$ R = \frac{760 \text{ mmHg} \times 22414 \text{ cm}^3}{1 \text{ mol} \times 273.15 \text{ K}} = \mathbf{62400 \text{ cm}^3\cdot\text{mmHg}\cdot\text{K}^{-1}\text{mol}^{-1}} $$
*(If $V$ is in $\text{dm}^3$ and $P$ is in mmHg, $R = 62.4$)*

**c. Pressure in $\text{N}\cdot\text{m}^{-2}$ (Pascals), Volume in $\text{m}^3$ (SI Units):**
(Substitute $1 \text{ atm} = 101325 \text{ Pa}$ and $22.414 \text{ dm}^3 = 0.022414 \text{ m}^3$)
$$ R = \frac{101325 \text{ N/m}^2 \times 0.022414 \text{ m}^3}{1 \text{ mol} \times 273.15 \text{ K}} = \mathbf{8.314 \text{ J}\cdot\text{K}^{-1}\text{mol}^{-1}} $$

### 4.3.3 / 4.3.4 Calculate Mass, Density, and Molar Mass
Substituting $n = \frac{m}{M}$ (mass / Molar mass) into the ideal gas equation:
$$ PV = \frac{m}{M}RT $$
Rearranging for Density ($d = \frac{m}{V}$):
$$ P = \frac{dRT}{M} \implies \mathbf{d = \frac{PM}{RT}} $$
Rearranging for Molar Mass:
$$ \mathbf{M = \frac{dRT}{P}} $$

### 4.3.5 Effect of Pressure on Scuba Divers at Varying Depths
- For every 10 meters a diver descends, hydrostatic pressure increases by 1 atm. At 30m depth, the total pressure is 4 atm (3 from water + 1 from atmosphere).
- According to **Henry's Law**, the solubility of a gas in a liquid is directly proportional to its pressure. At high depths, high amounts of Nitrogen gas dissolve in the diver's blood.
- If the diver ascends too rapidly, pressure drops rapidly, and the dissolved Nitrogen bubbles out of the blood (like opening a soda can), causing a painful and potentially fatal condition called **decompression sickness (the bends)**. To prevent this, divers use a mixture of Oxygen and Helium (He is much less soluble in blood than $N_2$).

---

## 4.4 Deviation from Ideal Behaviour

### 4.4.1 Explain Deviation of Gases from Ideal Behaviour
No real gas is perfectly ideal. Gases behave ideally only at **high temperatures and low pressures**.
Gases deviate significantly from ideal behavior under **low temperatures and high pressures**.
- **Why? (Failure of KMT Postulates):**
 1. At high pressure, molecules are forced close together. The volume of the gas molecules is no longer negligible compared to the heavily compressed container volume.
 2. At low temperatures, molecules move slowly. They spend more time near each other, allowing attractive intermolecular forces (Van der Waals forces) to take effect, pulling them together and reducing the pressure they exert on the walls.

---

## 4.5 Van der Waal's Equation

To account for deviations, J.D. van der Waals modified the ideal gas equation to correct for volume and pressure.

### 4.5.1 / 4.5.2 Pressure and Volume Correction and Derivation
**1. Volume Correction:**
Because gas molecules have their own volume, the actual "free" space available for movement is less than the total volume of the container.
- **Free Volume ($V_{free}$) = $V_{vessel} - nb$**
- Where $b$ is the "co-volume" or excluded volume per mole, representing the effective volume of the gas molecules.

**2. Pressure Correction:**
Because real molecules attract each other, a molecule approaching the container wall is pulled backward by the bulk of the gas. Therefore, it strikes the wall with less force. The ideal pressure would have been higher.
- **Ideal Pressure ($P_{ideal}$) = $P_{real} + \frac{an^2}{V^2}$**
- Where $a$ is the constant of proportionality representing the strength of intermolecular attractive forces.

**The Van der Waals Equation:**
Substituting these corrections into $PV = nRT$:
$$ \mathbf{\left( P + \frac{an^2}{V^2} \right) (V - nb) = nRT} $$

---

## 4.6 Liquefaction of Gases

### 4.6.1 Liquefaction Principle using Joule-Thomson Effect
- **Joule-Thomson Effect:** When a highly compressed gas is allowed to expand suddenly through a small nozzle into a region of low pressure, it causes severe cooling.
- **Why?** During sudden expansion, the gas molecules move apart against their own intermolecular attractive forces. To do this work, they consume their own internal kinetic energy. Since kinetic energy drops, the temperature of the gas drops.

### 4.6.2 Linde's Method for Liquefaction
Linde's method uses the Joule-Thomson effect repeatedly in a continuous cycle:
1. Air is compressed to a very high pressure (~200 atm).
2. It passes through a water-cooled pipe to remove the heat of compression.
3. The compressed gas is suddenly allowed to expand through a spiral tube with a nozzle. The expansion causes cooling.
4. This cooled gas is circulated back to cool the incoming compressed gas further.
5. The cycle repeats until the temperature drops below the gas's **critical temperature**, and it liquefies.

---

## 4.7 Fourth State of Matter: Plasma

### 4.7.1 Define the term 'Plasma'
Plasma is the fourth state of matter. It is a distinct, highly energetic macroscopic mixture of free electrons, positive ions, and neutral atoms, such that the overall substance is electrically neutral.

### 4.7.2 Explain the Formation of Plasma
When a solid is heated, it melts into a liquid. Heating a liquid turns it into a gas. If a gas is heated to extremely high temperatures (e.g., $100,000 \text{ K}$), the kinetic energy is so high that collisions between atoms violently knock electrons out of their orbits. The gas becomes **ionized**, forming a "soup" of free-moving electrons and positive atomic nuclei. This state is plasma.

### 4.7.3 Characteristics and Applications of Plasma
**Characteristics:**
- Unlike normal gases, plasma is highly conductive of electricity due to free electrons.
- It strongly interacts with electric and magnetic fields (can be trapped/shaped by magnetic fields).
- Makes up 99% of the visible universe (stars, the sun, interstellar matter).

**Applications:**
1. **Lighting:** Neon signs and fluorescent tubes contain gases that form plasma when an electric current is passed through them, emitting light.
2. **Electronics:** Used extensively in semiconductor manufacturing to etch microchips.
3. **Energy:** Magnetic confinement of plasma (e.g., in Tokamak reactors) is the basis for ongoing research into nuclear fusion power.
4. **Sterilization:** Used in medicine and food industries to destroy bacteria.
