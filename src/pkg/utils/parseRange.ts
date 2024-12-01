export function parseRangeList(rangeString: string): number[] {
    // Split the input string by commas
    const parts = rangeString.split(',');

    // Use a Set to automatically handle duplicates
    const result = new Set<number>();

    for (const part of parts) {
        // Check if the part contains a range (has a hyphen)
        if (part.includes('-')) {
            // Split the range into start and end
            const [start, end] = part.split('-').map(Number);

            // Ensure start is the lower number and end is the higher number
            const min = Math.min(start, end);
            const max = Math.max(start, end);

            // Add all numbers in the range
            for (let i = min; i <= max; i++) {
                result.add(i);
            }
        } else {
            // If it's a single number, convert and add
            result.add(Number(part));
        }
    }

    // Convert Set to sorted array
    return Array.from(result).sort((a, b) => a - b);
}
