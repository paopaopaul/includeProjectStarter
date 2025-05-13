'use client';

/**
 * Scrolls to a section on the page by its ID
 * @param sectionId - The ID of the section to scroll to (without the # symbol)
 * @param offset - Optional offset from the top of the section (in pixels)
 */
export const scrollToSection = (
  sectionId: string,
  offset: number = 0
): void => {
  // Default to 'home' if no sectionId is provided
  const targetId = sectionId || 'home';

  // Find the element
  const element = document.getElementById(targetId);

  if (element) {
    // Get the element's position
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    // Scroll to that position
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};
