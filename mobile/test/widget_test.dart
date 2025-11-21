// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:havilah_mobile/main.dart';

void main() {
  testWidgets('Shell renders navigation placeholders', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const HavilahApp());

    // Dashboard tab renders by default.
    expect(find.text('Learning Feed'), findsOneWidget);
    expect(find.text('Upload Notes'), findsNothing);

    // Switch to the Upload tab.
    await tester.tap(find.text('Upload'));
    await tester.pumpAndSettle();

    expect(find.text('Upload Notes'), findsOneWidget);
    expect(find.text('Profile & Goals'), findsNothing);

    // Switch to Profile tab.
    await tester.tap(find.text('Profile'));
    await tester.pumpAndSettle();

    expect(find.text('Profile & Goals'), findsOneWidget);
  });
}
