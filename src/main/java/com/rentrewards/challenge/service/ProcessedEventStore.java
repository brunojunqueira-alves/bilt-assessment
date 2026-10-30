package com.rentrewards.challenge.service;

import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks which webhook events have already been processed, so that the
 * RewardsEngine can ignore duplicate deliveries from the payment processor.
 */
public class ProcessedEventStore {

    // Fix Bug 01 (Idempotency & Concurrency):
    // Replaced the single `lastProcessedEventId` field with a thread-safe Set (ConcurrentHashMap.newKeySet()).
    // This retains all previously seen eventIds (handling out-of-order retries) and is safe under concurrent access.
    private final Set<String> processedEventIds = ConcurrentHashMap.newKeySet();

    /**
     * @return true if this eventId has already been processed before.
     */
    public boolean isDuplicate(String eventId) {
        return processedEventIds.contains(eventId);
    }

    public void markProcessed(String eventId) {
        processedEventIds.add(Objects.requireNonNull(eventId, "eventId"));
    }

    /**
     * Atomically claims the eventId if it has not been processed yet.
     *
     * @return true if this call was the first to claim the eventId, false if already processed.
     */
    public boolean tryMarkProcessed(String eventId) {
        // Atomic claim-if-absent operation: Set.add() on ConcurrentHashMap.newKeySet()
        // guarantees that only one thread can claim a given eventId when deliveries arrive concurrently.
        return processedEventIds.add(Objects.requireNonNull(eventId, "eventId"));
    }
}
